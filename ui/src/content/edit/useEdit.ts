import { useCallback, useMemo } from 'react';
import type {
  Change,
  UpdateLocation,
  DeleteLocation,
  CreateLocation,
  AggregatedCreateChanges,
  AggregatedUpdateChanges,
  AggregatedDeleteChanges,
  Location,
  CreateChange,
} from './types';
import { doChangeLocationsMatch, getValueString } from './utils';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { withQuotes } from '~/shared/utils/sql';

export const useEdit = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [changes, setChanges] = useStoredState<Change[]>('changes', [], sessionStorage);

  const clearChanges = useCallback(() => {
    setChanges([]);
  }, [setChanges]);

  const getChange = useCallback(
    (location: Location) =>
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
    (location: CreateLocation | UpdateLocation | DeleteLocation) => {
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
      Array<AggregatedCreateChanges | AggregatedUpdateChanges | AggregatedDeleteChanges>
    >((acc, change) => {
      const previousChanges = [...acc];

      const existingGroupIndex = previousChanges.findIndex(
        (group) =>
          group.location.table === change.location.table &&
          ((change.type === 'create' && group.type === 'create') ||
            (change.type === 'update' &&
              group.type === 'update' &&
              'column' in change.location &&
              group.location.column === change.location.column &&
              group.value === change.value) ||
            (change.type === 'delete' && group.type === 'delete')),
      );

      if (existingGroupIndex === -1) {
        if (change.type === 'create') {
          previousChanges.push({
            location: {
              table: change.location.table,
            },
            type: 'create',
            rows: [change.row],
          });
        }

        if (change.type === 'update') {
          previousChanges.push({
            location: {
              table: change.location.table,
              column: change.location.column,
              primaryKeys: [change.location.primaryKeys],
            },
            type: 'update',
            value: change.value,
          });
        }

        if (change.type === 'delete') {
          previousChanges.push({
            location: {
              table: change.location.table,
              primaryKeys: [change.location.primaryKeys],
            },
            type: 'delete',
          });
        }

        return previousChanges;
      }

      const existingChange = previousChanges[existingGroupIndex];
      if (existingChange.type === 'update' || existingChange.type === 'delete') {
        (
          existingChange as AggregatedUpdateChanges | AggregatedDeleteChanges
        ).location.primaryKeys.push(
          (change.location as UpdateLocation | DeleteLocation).primaryKeys,
        );
      } else {
        (existingChange as AggregatedCreateChanges).rows.push((change as CreateChange).row);
      }

      return previousChanges;
    }, []);

    return changesGroupedByColumnAndValue
      .map((change) => {
        const { location, type } = change;

        if (type === 'create') {
          const columns = Object.keys(change.rows[0]);
          const columnList = columns.map((column) => withQuotes(engine, column)).join(',\n  ');

          const valueRows = change.rows
            .map((row) => {
              const valueList = Object.values(row)
                .map((value) => getValueString(value))
                .join(', ');
              return `  (${valueList})`;
            })
            .join(',\n');

          return `INSERT INTO ${withQuotes(
            engine,
            location.table,
          )} (\n  ${columnList}\n) VALUES\n${valueRows};`;
        }

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
        )} = ${getValueString(change.value)}\n${where};`;
      })
      .join('\n\n');
  }, [activeConnection, changes]);

  return useMemo(
    () => ({ changes, clearChanges, getChange, handleChange, removeChange, sql }),
    [changes, clearChanges, getChange, handleChange, removeChange, sql],
  );
};
