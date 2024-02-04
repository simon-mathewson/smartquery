import { useCallback, useMemo, useState } from 'react';
import { Change, PrimaryKey } from './types';
import { Value } from '../queries/types';
import { isNotNull } from '~/shared/utils/typescript';
import { doChangeLocationsOverlap, doRowsOverlap } from './utils';

export const useEdit = () => {
  const [changes, setChanges] = useState<Change[]>([]);

  const handleChange = useCallback(
    (newChange: Change, originalRows: Array<{ primaryKeys: PrimaryKey[]; value: Value }>) => {
      setChanges((changes) => {
        const newChanges = changes
          .map((existingChange) => {
            if (!doChangeLocationsOverlap(existingChange.location, newChange.location))
              return existingChange;

            const withoutNewRows = {
              ...existingChange,
              location: {
                ...existingChange.location,
                rows: existingChange.location.rows.filter(
                  (row) => !doRowsOverlap(newChange.location.rows, [row]),
                ),
              },
            } satisfies Change;

            return withoutNewRows.location.rows.length ? withoutNewRows : null;
          })
          .filter(isNotNull);

        const changeWithoutUnchangedRows = {
          ...newChange,
          location: {
            ...newChange.location,
            rows: newChange.location.rows.filter((newChangeRow) => {
              const originalRow = originalRows.find((row) => doRowsOverlap([newChangeRow], [row]))!;
              return originalRow.value !== newChange.value;
            }),
          },
        } satisfies Change;

        if (changeWithoutUnchangedRows.location.rows.length) {
          return [...newChanges, changeWithoutUnchangedRows];
        }

        return newChanges;
      });
    },
    [],
  );

  return useMemo(() => ({ changes, handleChange }), [changes, handleChange]);
};
