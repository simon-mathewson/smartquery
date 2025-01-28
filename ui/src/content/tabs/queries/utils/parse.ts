import type { Connection } from '~/shared/types';
import { splitSqlStatements } from '~/shared/utils/sql/sql';
import { getAstForSql } from '~/shared/utils/sqlParser/getAstForSql';
import type { Select } from '../types';
import type NodeSqlParser from 'node-sql-parser';

const getSelectFromStatement = (props: {
  connection: Connection;
  statement: string;
}): Select | null => {
  const {
    connection: { engine, database: connectionDatabase },
    statement,
  } = props;

  const parsed = getAstForSql({ engine, statement });

  if (
    !parsed ||
    parsed.type !== 'select' ||
    parsed.from?.length !== 1 ||
    parsed.columns.some((column) => column.expr.type !== 'column_ref' || column.as !== null)
  ) {
    return null;
  }

  const table = parsed.from[0].table;
  if (!table) return null;

  const from = parsed.from[0];

  const selectSchema = ('db' in from && (from as NodeSqlParser.From).db) || undefined;

  const catalog = engine === 'postgresql' ? connectionDatabase : 'def';
  const schema = selectSchema ?? (engine === 'postgresql' ? 'public' : connectionDatabase);

  return {
    catalog,
    parsed,
    schema,
    table,
  };
};

export const parseQuery = (props: {
  connection: Connection;
  sql: string;
}): {
  select: Select | null;
  statements: string[] | null;
} => {
  const { connection, sql } = props;

  const statements = splitSqlStatements(sql);

  const select =
    statements.length === 1
      ? getSelectFromStatement({ connection, statement: statements[0] })
      : null;

  return {
    select,
    statements,
  };
};
