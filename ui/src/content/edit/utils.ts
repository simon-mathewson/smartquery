import { ChangeLocation, ChangeRow } from './types';

export const doRowsMatch = (row1: ChangeRow, row2: ChangeRow) =>
  row1.primaryKeys.every(
    (key, index) =>
      row2.primaryKeys[index].column === key.column && row2.primaryKeys[index].value === key.value,
  );

export const doChangeLocationsMatch = (change1: ChangeLocation, change2: ChangeLocation) =>
  change1.column === change2.column &&
  change1.table === change2.table &&
  doRowsMatch(change1.row, change2.row);
