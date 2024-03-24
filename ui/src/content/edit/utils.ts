import type { Value } from '~/shared/types';
import type { Location, PrimaryKey } from './types';

export const doChangeLocationsMatch = (
  change1: Omit<Location, 'originalValue' | 'type'>,
  change2: Omit<Location, 'originalValue' | 'type'>,
) =>
  change1.table === change2.table &&
  ((!('newRowId' in change1) && !('newRowId' in change2)) ||
    ('newRowId' in change1 && 'newRowId' in change2 && change1.newRowId === change2.newRowId)) &&
  (!('primaryKeys' in change1) ||
    !('primaryKeys' in change2) ||
    (change1.primaryKeys as PrimaryKey[]).every(
      (key, index) =>
        (change2.primaryKeys as PrimaryKey[])[index].column === key.column &&
        (change2.primaryKeys as PrimaryKey[])[index].value === key.value,
    )) &&
  (!('column' in change1) || !('column' in change2) || change1.column === change2.column);

export const getValueString = (value: Value) => {
  if (value === null) {
    return 'NULL';
  }
  if (value === undefined) {
    return 'DEFAULT';
  }
  return `'${value}'`;
};
