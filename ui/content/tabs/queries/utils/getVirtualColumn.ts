import type { Column } from '~/shared/types';
import type { DbValue } from '@/connector/types';
import { getDataTypeFromRows } from './getDataTypeFromRows';

export const getVirtualColumn = (rows: Record<string, DbValue>[], column: string): Column => ({
  ...getDataTypeFromRows(rows, column),
  foreignKey: null,
  isVisible: true,
  name: column,
  originalName: column,
  table: null,
  isVirtual: true,
});
