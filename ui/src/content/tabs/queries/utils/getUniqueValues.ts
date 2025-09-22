import type { Column, Row } from '~/shared/types';

export const getUniqueValues = (columns: Column[], rows: Row[], rowIndex: number) => {
  const uniqueColumns = columns.filter((column) => column.isPrimaryKey || column.isUnique);

  const row = rows.at(rowIndex);
  if (!row) return null;

  return uniqueColumns
    .filter((column) => column.name in row)
    .map((column) => ({
      column: column.originalName,
      value: rows[rowIndex][column.name] as string,
    }));
};
