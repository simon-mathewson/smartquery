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
  const { engine, database } = connection;

  const parsed = await getAstForSql({ engine, statement });

  if (!parsed || parsed.type !== 'select' || !Array.isArray(parsed.from)) {
    return null;
  }

  const tables = Array.isArray(parsed.from)
    ? parsed.from
        .map((from) => {
          if (!('table' in from)) {
            return null;
          }

          const explicitSchema = ('db' in from && (from as NodeSqlParser.BaseFrom).db) || undefined;
          const schema =
            explicitSchema ?? (connection.engine === 'postgres' ? connection.schema : database);

          return {
            name: from.as ?? from.table,
            originalName: from.table,
            schema,
          };
        })
        .filter(isNotNull)
    : [];
  if (!tables.length) return null;

  return {
    parsed,
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
