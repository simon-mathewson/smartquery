import { useCallback, useMemo } from 'react';
import type {
  AggregatedCreateChanges,
  AggregatedUpdateChanges,
  AggregatedDeleteChanges,
  Location,
  CreateChange,
  DeleteChange,
  UpdateChange,
  CreateChangeInput,
} from './types';
import { doChangeLocationsMatch, getValueString } from './utils';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { withQuotes } from '~/shared/utils/sql';

export const useEdit = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [createChanges, setCreateChanges] = useStoredState<CreateChange[]>(
    `createChanges-${activeConnection?.id}`,
    [],
    sessionStorage,
  );
  const [deleteChanges, setDeleteChanges] = useStoredState<DeleteChange[]>(
    `deleteChanges-${activeConnection?.id}`,
    [],
    sessionStorage,
  );
  const [updateChanges, setUpdateChanges] = useStoredState<UpdateChange[]>(
    `updateChanges-${activeConnection?.id}`,
    [],
    sessionStorage,
  );

  const clearChanges = useCallback(() => {
    setCreateChanges([]);
    setDeleteChanges([]);
    setUpdateChanges([]);
  }, [setCreateChanges, setDeleteChanges, setUpdateChanges]);

  const getChangeAtLocation = useCallback(
    (location: Location) =>
      [...createChanges, ...deleteChanges, ...updateChanges].find((change) =>
        doChangeLocationsMatch(change.location, location),
      ),
    [createChanges, deleteChanges, updateChanges],
  );

  const handleCreateChange = useCallback(
    (newChange: CreateChangeInput) => {
      setCreateChanges((changes) => {
        const newChanges = [...changes];
        const existingChangeIndex =
          newChange.location.index !== undefined
            ? newChanges.findIndex((existingChange) =>
                doChangeLocationsMatch(existingChange.location, newChange.location),
              )
            : -1;

        if (existingChangeIndex === -1) {
          return [
            ...changes,
            {
              ...newChange,
              location: {
                ...newChange.location,
                index: changes.length,
              },
            },
          ];
        }

        newChanges[existingChangeIndex] = newChange as CreateChange;

        return newChanges;
      });
    },
    [setCreateChanges],
  );

  const handleDeleteChange = useCallback(
    (newChange: DeleteChange) => {
      setDeleteChanges((changes) => {
        const newChanges = [...changes];
        const existingChangeIndex = newChanges.findIndex((existingChange) =>
          doChangeLocationsMatch(existingChange.location, newChange.location),
        );

        if (existingChangeIndex === -1) {
          return [...newChanges, newChange];
        }

        newChanges[existingChangeIndex] = newChange;

        return newChanges;
      });
    },
    [setDeleteChanges],
  );

  const handleUpdateChange = useCallback(
    (newChange: UpdateChange) => {
      setUpdateChanges((changes) => {
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
    [setUpdateChanges],
  );

  const removeChange = useCallback(
    (location: Location) => {
      if (location.type === 'create') {
        setCreateChanges((changes) =>
          changes
            .filter((change) => !doChangeLocationsMatch(change.location, location))
            .map((change, index) => ({
              ...change,
              location: {
                ...change.location,
                index,
              },
            })),
        );
      } else if (location.type === 'delete') {
        setDeleteChanges((changes) =>
          changes.filter((change) => !doChangeLocationsMatch(change.location, location)),
        );
      } else {
        setUpdateChanges((changes) =>
          changes.filter((change) => !doChangeLocationsMatch(change.location, location)),
        );
      }
    },
    [setCreateChanges, setDeleteChanges, setUpdateChanges],
  );

  const sql = useMemo(() => {
    if (!activeConnection) return '';

    const { engine } = activeConnection;

    const aggregatedCreateChanges = createChanges.reduce<AggregatedCreateChanges[]>(
      (acc, change) => {
        const previousChanges = [...acc];

        const existingGroupIndex = previousChanges.findIndex(
          (group) => group.location.table === change.location.table,
        );

        if (existingGroupIndex === -1) {
          previousChanges.push({
            location: {
              table: change.location.table,
            },
            rows: [change.row],
          });

          return previousChanges;
        }

        previousChanges[existingGroupIndex].rows.push(change.row);

        return previousChanges;
      },
      [],
    );

    const aggregatedDeleteChanges = deleteChanges.reduce<AggregatedDeleteChanges[]>(
      (acc, change) => {
        const previousChanges = [...acc];

        const existingGroupIndex = previousChanges.findIndex(
          (group) => group.location.table === change.location.table,
        );

        if (existingGroupIndex === -1) {
          previousChanges.push({
            location: {
              table: change.location.table,
              primaryKeys: [change.location.primaryKeys],
            },
          });

          return previousChanges;
        }

        previousChanges[existingGroupIndex].location.primaryKeys.push(change.location.primaryKeys);

        return previousChanges;
      },
      [],
    );

    const aggregatedUpdateChanges = updateChanges.reduce<AggregatedUpdateChanges[]>(
      (acc, change) => {
        const previousChanges = [...acc];

        const existingGroupIndex = previousChanges.findIndex(
          (group) =>
            group.location.table === change.location.table &&
            group.location.column === change.location.column &&
            group.value === change.value,
        );

        if (existingGroupIndex === -1) {
          previousChanges.push({
            location: {
              table: change.location.table,
              column: change.location.column,
              primaryKeys: [change.location.primaryKeys],
            },
            value: change.value,
          });

          return previousChanges;
        }

        previousChanges[existingGroupIndex].location.primaryKeys.push(change.location.primaryKeys);

        return previousChanges;
      },
      [],
    );

    const createStatements = aggregatedCreateChanges.map((change) => {
      const { location } = change;

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
    });

    const deleteStatements = aggregatedDeleteChanges.map((change) => {
      const { location } = change;

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

      return `DELETE FROM ${withQuotes(engine, location.table)}\n${where};`;
    });

    const updateStatements = aggregatedUpdateChanges.map((change) => {
      const { location } = change;

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

      return `UPDATE ${withQuotes(engine, location.table)}\nSET ${withQuotes(
        engine,
        location.column,
      )} = ${getValueString(change.value)}\n${where};`;
    });

    return [...deleteStatements, ...createStatements, ...updateStatements].join('\n\n');
  }, [activeConnection, createChanges, deleteChanges, updateChanges]);

  const allChanges = useMemo(
    () => [...createChanges, ...deleteChanges, ...updateChanges],
    [createChanges, deleteChanges, updateChanges],
  );

  return useMemo(
    () => ({
      allChanges,
      clearChanges,
      createChanges,
      deleteChanges,
      getChangeAtLocation,
      handleCreateChange,
      handleDeleteChange,
      handleUpdateChange,
      removeChange,
      setCreateChanges,
      setDeleteChanges,
      setUpdateChanges,
      sql,
      updateChanges,
    }),
    [
      allChanges,
      clearChanges,
      createChanges,
      deleteChanges,
      getChangeAtLocation,
      handleCreateChange,
      handleDeleteChange,
      handleUpdateChange,
      removeChange,
      setCreateChanges,
      setDeleteChanges,
      setUpdateChanges,
      sql,
      updateChanges,
    ],
  );
};
