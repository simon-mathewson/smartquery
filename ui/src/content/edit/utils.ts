import type { UpdateLocation, DeleteLocation } from './types';

export const doChangeLocationsMatch = (
  change1: Omit<UpdateLocation, 'originalValue'> | DeleteLocation,
  change2: Omit<UpdateLocation, 'originalValue'> | DeleteLocation,
) =>
  (('column' in change1 && 'column' in change2 && change1.column === change2.column) ||
    !('column' in change1) ||
    !('column' in change2)) &&
  change1.table === change2.table &&
  change1.primaryKeys.every(
    (key, index) =>
      change2.primaryKeys[index].column === key.column &&
      change2.primaryKeys[index].value === key.value,
  );
