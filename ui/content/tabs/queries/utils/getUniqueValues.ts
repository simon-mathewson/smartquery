import type { Column } from '~/shared/types';
import type { DbValue } from '@/native/types';
import { getUniqueColumns } from './getUniqueColumns';

export const getUniqueValues = (columns: Column[], row: DbValue[] | undefined) => {
  if (!row) return null;

  return getUniqueColumns(columns)
    .filter(({ index }) => index in row)
    .map(({ column, index }) => ({
      column: column.originalName,
      value: row[index] as string,
    }));
};
