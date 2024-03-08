import type { Column, Row } from '~/shared/types';

export const getPrimaryKeys = (columns: Column[], rows: Row[], rowIndex: number) => {
  const primaryKeyColumns = columns.filter((column) => column.isPrimaryKey);

  const row = rows.at(rowIndex);
  if (!row) return null;

  const arePrimaryKeysAvailable = primaryKeyColumns.every(
    (column) => (column.alias ?? column.name) in row,
  );
  if (!arePrimaryKeysAvailable) return null;

  return primaryKeyColumns.map((column) => ({
    column: column.name,
    value: rows[rowIndex][column.alias ?? column.name] as string,
  }));
};
