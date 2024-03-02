import type { UpdateLocation, DeleteLocation } from './types';

export const doChangeLocationsMatch = <Location extends UpdateLocation | DeleteLocation>(
  change1: Location,
  change2: Location,
) =>
  (('column' in change1 && 'column' in change2 && change1.column === change2.column) ||
    !('column' in change1)) &&
  change1.table === change2.table &&
  change1.primaryKeys.every(
    (key, index) =>
      change2.primaryKeys[index].column === key.column &&
      change2.primaryKeys[index].value === key.value,
  );
