import type { Column } from '~/shared/types';

export const getUniqueColumns = (columns: Column[]) =>
  columns
    .map((column, index) => ({ column, index }))
    .filter(({ column }) => column.isPrimaryKey || column.isUnique);
