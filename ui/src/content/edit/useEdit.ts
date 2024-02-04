import { useCallback, useMemo, useState } from 'react';
import { Change, ChangeLocation } from './types';
import { doChangeLocationsMatch } from './utils';

export const useEdit = () => {
  const [changes, setChanges] = useState<Change[]>([]);

  const getChangedValue = useCallback(
    (location: ChangeLocation) =>
      changes.find((change) => doChangeLocationsMatch(change.location, location))?.value,
    [changes],
  );

  const handleChange = useCallback((newChange: Change) => {
    setChanges((changes) => {
      const newChanges = [...changes];

      const existingChangeIndex = newChanges.findIndex((existingChange) =>
        doChangeLocationsMatch(existingChange.location, newChange.location),
      );

      const isNewValueSameAsOriginalValue = newChange.value === newChange.location.row.value;

      if (isNewValueSameAsOriginalValue) {
        if (existingChangeIndex === -1) return newChanges;
        newChanges.splice(existingChangeIndex, 1);
        return newChanges;
      }

      if (existingChangeIndex === -1) {
        return [...newChanges, newChange];
      }

      newChanges[existingChangeIndex] = newChange;

      return newChanges;
    });
  }, []);

  return useMemo(
    () => ({ changes, getChangedValue, handleChange }),
    [changes, getChangedValue, handleChange],
  );
};
