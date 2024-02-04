import { ChangeLocation, ChangeRow } from './types';

export const doRowsOverlap = (rows1: ChangeRow[], rows2: ChangeRow[]) =>
  rows1.some((row) =>
    row.primaryKeys.every((key, index) =>
      rows2.some(
        (row) =>
          row.primaryKeys[index].column === key.column &&
          row.primaryKeys[index].value === key.value,
      ),
    ),
  );

export const doChangeLocationsOverlap = (change1: ChangeLocation, change2: ChangeLocation) =>
  change1.column === change2.column &&
  change1.table === change2.table &&
  doRowsOverlap(change1.rows, change2.rows);
