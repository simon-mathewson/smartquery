import type { Column } from '~/shared/types';
import type { DbValue } from '@/native/types';

export const getUniqueValues = (columns: Column[], row: DbValue[] | undefined) => {
  if (!row) return null;

  const uniqueColumns = columns
    .map((column, index) => ({ column, index }))
    .filter(({ column, index }) => (column.isPrimaryKey || column.isUnique) && index in row);

  return uniqueColumns.map(({ column, index }) => ({
    column: column.originalName,
    value: row[index] as string,
  }));
};
