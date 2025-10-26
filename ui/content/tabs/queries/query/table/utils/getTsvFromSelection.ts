import type { CreateRow } from '~/content/edit/types';
import type { DbValue } from '@/connector/types';

const nullString = 'NULL';

export const getTsvFromSelection = (selection: number[][], rows: Array<DbValue[] | CreateRow>) => {
  const minColumnIndex = Math.min(
    ...selection.flatMap((columnIndices) => (columnIndices.length === 0 ? [0] : columnIndices)),
  );
  const maxColumnIndex = Math.max(
    ...selection.flatMap((columnIndices) =>
      columnIndices.length === 0 ? [Object.values(rows[0]).length - 1] : columnIndices,
    ),
  );

  const cells: string[][] = selection
    .map((columnIndices, rowIndex) => {
      const row = rows[rowIndex];
      if (!row) {
        throw new Error('Row not found');
      }

      return Object.values(row)
        .map((value, columnIndex) => {
          if (columnIndices.length && !columnIndices.includes(columnIndex)) {
            return '';
          }
          if (value === null) {
            return nullString;
          }
          return value ?? '';
        })
        .slice(minColumnIndex, maxColumnIndex + 1);
    })
    .filter(Boolean);

  return cells.map((row) => row.join('\t')).join('\n');
};
