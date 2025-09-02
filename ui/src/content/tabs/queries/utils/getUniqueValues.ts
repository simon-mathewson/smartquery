import type { Column, Row } from '~/shared/types';

export const getUniqueValues = (columns: Column[], rows: Row[], rowIndex: number) => {
  const uniqueColumns = columns.filter((column) => column.isPrimaryKey || column.isUnique);

  const row = rows.at(rowIndex);
  if (!row) return null;

  const areUniqueValuesAvailable = uniqueColumns.every((column) => column.name in row);
  if (!areUniqueValuesAvailable) return null;

  return uniqueColumns.map((column) => ({
    column: column.name,
    value: rows[rowIndex][column.name] as string,
  }));
};
