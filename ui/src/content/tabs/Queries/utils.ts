import type { Column, Row } from '~/shared/types';

export const getPrimaryKeys = (columns: Column[], rows: Row[], rowIndex: number) =>
  columns
    ?.filter((column) => column.isPrimaryKey)
    .map((column) => ({
      column: column.name,
      value: rows[rowIndex][column.name] as string | number,
    })) ?? null;
