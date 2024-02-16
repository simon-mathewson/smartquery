import type { Query } from './types';

export const getPrimaryKeys = (query: Query, rowIndex: number) =>
  query.columns
    .filter((column) => column.isPrimaryKey)
    .map((column) => ({
      column: column.name,
      value: query.rows[rowIndex][column.name] as string | number,
    }));
