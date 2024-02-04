import { useCallback, useMemo, useState } from 'react';
import { Change, PrimaryKey } from './types';
import { Value } from '../queries/types';
import { isNotNull } from '~/shared/utils/typescript';
import { doChangesOverlap, doRowsOverlap } from './utils';

export const useEdit = () => {
  const [changes, setChanges] = useState<Change[]>([]);

  const handleChange = useCallback(
    (newChange: Change, originalRows: Array<{ primaryKeys: PrimaryKey[]; value: Value }>) => {
      setChanges((changes) => {
        const newChanges = changes
          .map((existingChange) => {
            if (!doChangesOverlap(existingChange, newChange)) return existingChange;

            const withoutNewRows = {
              ...existingChange,
              rows: existingChange.rows.filter((row) => !doRowsOverlap(newChange.rows, [row])),
            };

            return withoutNewRows.rows.length ? withoutNewRows : null;
          })
          .filter(isNotNull);

        const changeWithoutUnchangedRows = {
          ...newChange,
          rows: newChange.rows.filter((newChangeRow) => {
            const originalRow = originalRows.find((row) => doRowsOverlap([newChangeRow], [row]))!;
            return originalRow.value !== newChange.value;
          }),
        };

        if (changeWithoutUnchangedRows.rows.length) {
          return [...newChanges, changeWithoutUnchangedRows];
        }

        return newChanges;
      });
    },
    [],
  );

  return useMemo(() => ({ changes, handleChange }), [changes, handleChange]);
};
