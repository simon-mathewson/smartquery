import type { Connection } from '@/connections/types';
import type NodeSqlParser from 'node-sql-parser';
import { splitSqlStatements } from '~/shared/utils/sql/sql';
import { getAstForSql } from '~/shared/utils/sqlParser/getAstForSql';
import { isNotNull } from '~/shared/utils/typescript/typescript';
import type { Select } from '../types';

export const getSelectFromStatement = async (props: {
  connection: Connection;
  statement: string;
}): Promise<Select | null> => {
  const { connection, statement } = props;
  const { engine, database: connectionDatabase } = connection;

  const parsed = await getAstForSql({ engine, statement });

  if (
    !parsed ||
    parsed.type !== 'select' ||
    !Array.isArray(parsed.from) ||
    parsed.columns.some((column) => column.expr.type !== 'column_ref')
  ) {
    return null;
  }

  const tables = Array.isArray(parsed.from)
    ? parsed.from
        .map((from) => {
          if (!('table' in from)) {
            return null;
          }

          return {
            name: from.as ?? from.table,
            originalName: from.table,
          };
        })
        .filter(isNotNull)
    : [];
  if (!tables.length) return null;

  const from = parsed.from[0];

  const selectSchemaOrDatabase = ('db' in from && (from as NodeSqlParser.BaseFrom).db) || undefined;

  const database =
    engine === 'postgres' ? connectionDatabase : selectSchemaOrDatabase ?? connectionDatabase;
  const schema = engine === 'postgres' ? selectSchemaOrDatabase ?? connection.schema : undefined;

  return {
    database,
    parsed,
    schema,
    tables,
  };
};

export const parseQuery = async (props: {
  connection: Connection;
  sql: string;
}): Promise<{
  select: Select | null;
  statements: string[] | null;
}> => {
  const { connection, sql } = props;

  const statements = splitSqlStatements(sql);

  const select =
    statements.length === 1
      ? await getSelectFromStatement({ connection, statement: statements[0] })
      : null;

  return {
    select,
    statements,
  };
};
