import type { Column, DbValue } from '~/shared/types';
import { getDataTypeFromRows } from './getDataTypeFromRows';

export const getVirtualColumns = (
  rows: Record<string, DbValue>[],
  columnsToIgnore?: string[],
): Column[] => {
  const virtualColumnNames = Object.keys(rows[0]).filter(
    (columnName) => !columnsToIgnore?.includes(columnName),
  );

  return virtualColumnNames.map(
    (columnName) =>
      ({
        ...getDataTypeFromRows(rows, columnName),
        foreignKey: null,
        isVisible: true,
        name: columnName,
        originalName: columnName,
        table: null,
        virtual: true,
      }) satisfies Column,
  );
};
