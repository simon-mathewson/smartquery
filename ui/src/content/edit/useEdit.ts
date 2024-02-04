import { useCallback, useMemo } from 'react';
import { Change, ChangeLocation, ChangeRow } from './types';
import { doChangeLocationsMatch } from './utils';
import { useLocalStorageState } from '~/shared/hooks/useLocalStorageState';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { withQuotes } from '~/shared/utils/sql';

export const useEdit = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [changes, setChanges] = useLocalStorageState<Change[]>('changes', []);

  const clearChanges = useCallback(() => {
    setChanges([]);
  }, [setChanges]);

  const getChangedValue = useCallback(
    (location: ChangeLocation) =>
      changes.find((change) => doChangeLocationsMatch(change.location, location))?.value,
    [changes],
  );

  const handleChange = useCallback(
    (newChange: Change) => {
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
    },
    [setChanges],
  );

  const sql = useMemo(() => {
    if (!activeConnection) return '';

    const { engine } = activeConnection;

    const changesGroupedByColumnAndValue = changes.reduce<
      Array<
        Omit<Change, 'location'> & { location: Omit<ChangeLocation, 'row'> & { rows: ChangeRow[] } }
      >
    >((acc, change) => {
      const { location, value } = change;

      const previousChanges = [...acc];

      const existingGroupIndex = previousChanges.findIndex(
        (group) =>
          group.location.table === location.table &&
          group.location.column === location.column &&
          group.value === value,
      );

      if (existingGroupIndex === -1) {
        return [
          ...acc,
          {
            location: {
              table: location.table,
              column: location.column,
              rows: [location.row],
            },
            value,
          },
        ];
      }

      previousChanges[existingGroupIndex].location.rows.push(location.row);

      return previousChanges;
    }, []);

    return changesGroupedByColumnAndValue
      .map((change) => {
        const { location, value } = change;
        const primaryKeyConditions = location.rows
          .map(({ primaryKeys }) => {
            return primaryKeys
              .map((primaryKey) => {
                return `${withQuotes(engine, primaryKey.column)} = '${primaryKey.value}'`;
              })
              .join(' AND ');
          })
          .join('\n   OR ');

        return `UPDATE ${withQuotes(engine, location.table)}\nSET ${withQuotes(
          engine,
          location.column,
        )} = '${value}'\nWHERE ${primaryKeyConditions};`;
      })
      .join('\n\n');
  }, [activeConnection, changes]);

  return useMemo(
    () => ({ changes, clearChanges, getChangedValue, handleChange, sql }),
    [changes, clearChanges, getChangedValue, handleChange, sql],
  );
};
