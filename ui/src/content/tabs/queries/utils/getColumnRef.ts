import type { Column } from '~/shared/types';
import type NodeSqlParser from 'node-sql-parser';

export const getColumnRef = (column: Column) => {
  const isColumnAlias = column.name !== column.originalName;

  return {
    column: column.name,
    table: isColumnAlias ? null : column.table?.name ?? null,
  };
};

export const getColumnRefFromAst = (columnExpr: NodeSqlParser.ColumnRef | NodeSqlParser.Value) => {
  if ('column' in columnExpr && typeof columnExpr.column === 'string') {
    return {
      column: columnExpr.column,
      table: 'table' in columnExpr ? columnExpr.table : null,
    };
  }
  if ('value' in columnExpr && typeof columnExpr.value === 'string') {
    return {
      column: columnExpr.value,
      table: null,
    };
  }
  throw new Error(`Unable to find column in expression: ${JSON.stringify(columnExpr)}`);
};
