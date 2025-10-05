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
): ColumnRef | null => {
  const ref = 'expr' in column ? column.expr : column;

  const columnName = (() => {
    if ('value' in ref && typeof ref.value === 'string') {
      return ref.value;
    }
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
    return null;
  }

  return {
    column: columnName,
    table: tableName,
  };
};

export const compareColumnRefs = (a: ColumnRef | null, b: ColumnRef | null) =>
  (!a && !b) || (a?.column === b?.column && (!a?.table || !b?.table || a.table === b.table));
