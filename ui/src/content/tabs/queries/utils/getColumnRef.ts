import type { Column } from '~/shared/types';
import type NodeSqlParser from 'node-sql-parser';

export type ColumnRef = {
  column: string;
  table: string | null;
};

export const getColumnRef = (column: Column): ColumnRef => {
  const isColumnAlias = column.name !== column.originalName;

  return {
    column: column.name,
    table: isColumnAlias ? null : column.table?.name ?? null,
  };
};

export const getColumnRefFromAst = (
  column: NodeSqlParser.ColumnRef | NodeSqlParser.Column,
): ColumnRef => {
  const ref = 'expr' in column ? column.expr : column;

  const columnName = (() => {
    if (!('column' in ref) || ref.type !== 'column_ref') {
      return null;
    }
    if (typeof ref.column === 'string') {
      return ref.column;
    }
    if (typeof ref.column.expr.value === 'string') {
      return ref.column.expr.value;
    }
  })();

  const tableName = 'table' in ref ? ref.table : null;

  if (!columnName) {
    throw new Error(`Unable to find column in expression: ${JSON.stringify(ref)}`);
  }

  return {
    column: columnName,
    table: tableName,
  };
};
