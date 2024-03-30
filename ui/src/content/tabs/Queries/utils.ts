import type { Column, Row } from '~/shared/types';
import type { Select } from 'node-sql-parser';

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

export const getLimitAndOffset = (parsedQuery: Select) => {
  if (
    !parsedQuery?.limit ||
    (parsedQuery.limit.seperator === 'offset' && parsedQuery.limit.value.length < 2)
  ) {
    return null;
  }

  const limitIndex = parsedQuery.limit.seperator === ',' ? 1 : 0;
  const offsetIndex = parsedQuery.limit.seperator === ',' ? 0 : 1;

  return {
    limit: parsedQuery.limit.value.at(limitIndex)?.value,
    offset: parsedQuery.limit.value.at(offsetIndex)?.value,
  };
};

export const setLimitAndOffset = (parsedQuery: Select, limit: number, offset?: number) => {
  const value = [{ type: 'number', value: limit }];

  if (offset !== undefined) {
    value.push({ type: 'number', value: offset });
  }

  parsedQuery.limit = { seperator: ' OFFSET', value };
};
