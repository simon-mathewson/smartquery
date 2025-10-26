import type { Column } from '~/shared/types';
import type { DbValue } from '@/connector/types';

export const getUniqueValues = (columns: Column[], row: DbValue[] | undefined) => {
  if (!row) return null;

  const uniqueColumns = columns
    .filter((column, index) => (column.isPrimaryKey || column.isUnique) && index in row)
    .map((column, index) => ({ column, index }));

  return uniqueColumns.map(({ column, index }) => ({
    column: column.originalName,
    value: row[index] as string,
  }));
};
