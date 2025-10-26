import type { Column } from '~/shared/types';
import type NodeSqlParser from 'node-sql-parser';

export type ColumnRef = {
  column: string;
  table: string | null;
  schema: string | null;
};

export const getColumnRef = (column: Column, currentSchema: string | undefined): ColumnRef => {
  const table = column.table?.originalName;
  const schema = column.table?.schema;

  return {
    column: column.originalName,
    table: table ?? null,
    schema: schema === currentSchema ? null : schema ?? null,
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

  const tableName = 'table' in ref ? (ref.table as string | { value: string }) : null;
  const actualTableName =
    tableName && typeof tableName === 'object' && 'value' in tableName
      ? tableName.value
      : tableName;
  const schema = 'db' in ref ? (ref.db as string | { value: string }) : null;
  const actualSchema =
    schema && typeof schema === 'object' && 'value' in schema ? schema.value : schema;

  if (!columnName) {
    return null;
  }

  return {
    column: columnName,
    table: actualTableName,
    schema: actualSchema,
  };
};

export const compareColumnRefs = (a: ColumnRef | null, b: ColumnRef | null) =>
  (!a && !b) ||
  (a?.column === b?.column &&
    (!a?.table || !b?.table || a.table === b.table) &&
    (!a?.schema || !b?.schema || a.schema === b.schema));
