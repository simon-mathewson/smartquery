import type { Connection } from '~/shared/types';
import { splitSqlStatements } from '~/shared/utils/sql/sql';
import { getAstForSql } from '~/shared/utils/sqlParser/getAstForSql';
import type { Select } from '../types';

const getSelectFromStatement = (props: {
  engine: Connection['engine'];
  statement: string;
}): Select | null => {
  const { engine, statement } = props;

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

  return { parsed, table };
};

export const parseQuery = (props: {
  engine: Connection['engine'];
  sql: string;
}): {
  select: Select | null;
  statements: string[] | null;
} => {
  const { engine, sql } = props;

  const statements = splitSqlStatements(sql);

  const select =
    statements.length === 1 ? getSelectFromStatement({ engine, statement: statements[0] }) : null;

  return {
    select,
    statements,
  };
};
