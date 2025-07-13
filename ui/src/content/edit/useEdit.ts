import { useCallback, useContext, useMemo } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { addQuotes } from '~/shared/utils/sql/sql';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import type {
  AggregatedCreateChanges,
  AggregatedDeleteChanges,
  AggregatedUpdateChanges,
  CreateChange,
  CreateChangeInput,
  DeleteChange,
  Location,
  UpdateChange,
} from './types';
import { doChangeLocationsMatch, getValueString } from './utils';

export const useEdit = () => {
  const activeConnectionContext = useContext(ActiveConnectionContext);

  const [createChanges, setCreateChanges] = useStoredState<CreateChange[]>(
    `createChanges-${activeConnectionContext?.activeConnection.id}`,
    [],
    sessionStorage,
  );
  const [deleteChanges, setDeleteChanges] = useStoredState<DeleteChange[]>(
    `deleteChanges-${activeConnectionContext?.activeConnection.id}`,
    [],
    sessionStorage,
  );
  const [updateChanges, setUpdateChanges] = useStoredState<UpdateChange[]>(
    `updateChanges-${activeConnectionContext?.activeConnection.id}`,
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
      setUpdateChanges((changes) =>
        changes.filter((change) => !doChangeLocationsMatch(change.location, newChange.location)),
      );

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
    [setDeleteChanges, setUpdateChanges],
  );

  const handleUpdateChange = useCallback(
    (newChange: UpdateChange) => {
      setDeleteChanges((changes) =>
        changes.filter((change) => !doChangeLocationsMatch(change.location, newChange.location)),
      );

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
    [setDeleteChanges, setUpdateChanges],
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
    if (!activeConnectionContext) return '';

    const { activeConnection } = activeConnectionContext;

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
      const columnList = columns.map((column) => addQuotes(engine, column)).join(',\n  ');

      const valueRows = change.rows
        .map((row) => {
          const valueList = Object.values(row)
            .map((value) => getValueString(value))
            .join(', ');
          return `  (${valueList})`;
        })
        .join(',\n');

      return `INSERT INTO ${addQuotes(
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
              return `${addQuotes(engine, primaryKey.column)} = '${primaryKey.value}'`;
            })
            .join(' AND ');
        })
        .join('\n   OR ');

      const where = `WHERE ${primaryKeyConditions}`;

      return `DELETE FROM ${addQuotes(engine, location.table)}\n${where};`;
    });

    const updateStatements = aggregatedUpdateChanges.map((change) => {
      const { location } = change;

      const primaryKeyConditions = location.primaryKeys
        .map((primaryKeys) => {
          return primaryKeys
            .map((primaryKey) => {
              return `${addQuotes(engine, primaryKey.column)} = '${primaryKey.value}'`;
            })
            .join(' AND ');
        })
        .join('\n   OR ');

      const where = `WHERE ${primaryKeyConditions}`;

      return `UPDATE ${addQuotes(engine, location.table)}\nSET ${addQuotes(
        engine,
        location.column,
      )} = ${getValueString(change.value)}\n${where};`;
    });

    return [...deleteStatements, ...createStatements, ...updateStatements].join('\n\n');
  }, [activeConnectionContext, createChanges, deleteChanges, updateChanges]);

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
