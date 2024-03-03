import { useCallback, useMemo } from 'react';
import type { Change, UpdateLocation, DeleteLocation, PrimaryKey } from './types';
import { doChangeLocationsMatch } from './utils';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { withQuotes } from '~/shared/utils/sql';
import type { Value } from '~/shared/types';

export const useEdit = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [changes, setChanges] = useStoredState<Change[]>('changes', [], sessionStorage);

  const clearChanges = useCallback(() => {
    setChanges([]);
  }, [setChanges]);

  const getChange = useCallback(
    (location: UpdateLocation) =>
      changes.find((change) => doChangeLocationsMatch(change.location, location)),
    [changes],
  );

  const handleChange = useCallback(
    (newChange: Change) => {
      setChanges((changes) => {
        const newChanges = [...changes];

        const existingChangeIndex = newChanges.findIndex((existingChange) =>
          doChangeLocationsMatch(existingChange.location, newChange.location),
        );

        const isNewValueSameAsOriginalValue =
          newChange.type === 'update' && newChange.value === newChange.location.originalValue;

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

  const removeChange = useCallback(
    (location: UpdateLocation | DeleteLocation) => {
      setChanges((changes) =>
        changes.filter((change) => !doChangeLocationsMatch(change.location, location)),
      );
    },
    [setChanges],
  );

  const sql = useMemo(() => {
    if (!activeConnection) return '';

    const { engine } = activeConnection;

    const changesGroupedByColumnAndValue = changes.reduce<
      Array<
        | ({ type: 'update'; value: Value } & {
            location: Pick<UpdateLocation, 'column' | 'table'> & { primaryKeys: PrimaryKey[][] };
          })
        | ({ type: 'delete' } & {
            location: Pick<DeleteLocation, 'table'> & { primaryKeys: PrimaryKey[][] };
          })
      >
    >((acc, change) => {
      const previousChanges = [...acc];

      const existingGroupIndex = previousChanges.findIndex(
        (group) =>
          group.location.table === change.location.table &&
          ((change.type === 'update' &&
            group.type === 'update' &&
            'column' in change.location &&
            group.location.column === change.location.column &&
            group.value === change.value) ||
            (change.type === 'delete' && group.type === 'delete')),
      );

      if (existingGroupIndex === -1) {
        return [
          ...acc,
          change.type === 'update'
            ? {
                location: {
                  table: change.location.table,
                  column: change.location.column,
                  primaryKeys: [change.location.primaryKeys],
                },
                type: 'update',
                value: change.value,
              }
            : {
                location: {
                  table: change.location.table,
                  primaryKeys: [change.location.primaryKeys],
                },
                type: 'delete',
              },
        ];
      }

      previousChanges[existingGroupIndex].location.primaryKeys.push(change.location.primaryKeys);

      return previousChanges;
    }, []);

    return changesGroupedByColumnAndValue
      .map((change) => {
        const { location, type } = change;

        const primaryKeyConditions = location.primaryKeys
          .map((primaryKeys) => {
            return primaryKeys
              .map((primaryKey) => {
                return `${withQuotes(engine, primaryKey.column)} = '${primaryKey.value}'`;
              })
              .join(' AND ');
          })
          .join('\n   OR ');

        const where = `WHERE ${primaryKeyConditions}`;

        if (type === 'delete') {
          return `DELETE FROM ${withQuotes(engine, location.table)}\n${where};`;
        }

        return `UPDATE ${withQuotes(engine, location.table)}\nSET ${withQuotes(
          engine,
          location.column,
        )} = ${change.value === null ? 'NULL' : `'${change.value}'`}\n${where};`;
      })
      .join('\n\n');
  }, [activeConnection, changes]);

  return useMemo(
    () => ({ changes, clearChanges, getChange, handleChange, removeChange, sql }),
    [changes, clearChanges, getChange, handleChange, removeChange, sql],
  );
};
