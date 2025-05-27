import { omit } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '~/content/connections/Context';
import { LinkApiContext } from '~/content/link/api/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { SchemaDefinitions } from './types';
import { DateTime } from 'luxon';
import { ToastContext } from '~/content/toast/Context';
import { getStatements } from './getStatements';
import { convertSqliteResultsToRecords } from '~/shared/utils/sqlite/sqlite';

export const useSchemaDefinitions = () => {
  const toast = useDefinedContext(ToastContext);

  const linkApi = useDefinedContext(LinkApiContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);
  assert(activeConnection);

  const { engine, id, database } = activeConnection;

  const [isLoading, setIsLoading] = useState(false);

  const [storedSchemaDefinitions, setStoredSchemaDefinitions] =
    useStoredState<SchemaDefinitions | null>(
      `useSchemaDefinitions.schemaDefinitions.${id}.${database}${
        engine === 'postgresql' ? `.${activeConnection.schema}` : ''
      }`,
      null,
    );

  const getSchemaDefinitions = useCallback(async () => {
    if (
      storedSchemaDefinitions &&
      DateTime.fromJSDate(storedSchemaDefinitions.createdAt).diffNow().minutes < 5
    ) {
      return storedSchemaDefinitions;
    }

    setIsLoading(true);

    try {
      if ('sqliteDb' in activeConnection) {
        const [sqliteResults] = convertSqliteResultsToRecords([
          activeConnection.sqliteDb.exec('SELECT type, name, tbl_name, sql FROM sqlite_master')[0],
        ]);

        const sqliteDefinitions = {
          createdAt: new Date(),
          definitions: {
            tables: sqliteResults,
          },
        } satisfies SchemaDefinitions;

        setStoredSchemaDefinitions(sqliteDefinitions);

        return sqliteDefinitions;
      }

      const results = await linkApi.sendQuery.mutate({
        clientId: activeConnection.clientId,
        statements: getStatements(activeConnection),
      });

      const [tables, columns, tableConstraints, views] = results;

      const processedTables = tables.map((table) => {
        return {
          ...table,
          columns: columns
            .filter((column) => column.table_name === table.table_name)
            .map((column) => omit(column, 'table_name')),
          tableConstraints: tableConstraints
            .filter((constraint) => constraint.table_name === table.table_name)
            .map((constraint) => omit(constraint, 'table_name')),
        };
      });

      const newSchemaDefinitions = {
        createdAt: new Date(),
        definitions: {
          tables: processedTables,
          views,
        },
      } satisfies SchemaDefinitions;

      setStoredSchemaDefinitions(newSchemaDefinitions);

      return newSchemaDefinitions;
    } catch (error) {
      toast.add({
        title: 'Error fetching schema definitions',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'danger',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    activeConnection,
    setStoredSchemaDefinitions,
    storedSchemaDefinitions,
    toast,
    linkApi.sendQuery,
  ]);

  // Fetch schema definitions when active connection changes
  useEffect(() => {
    getSchemaDefinitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  return useMemo(
    () => ({
      getSchemaDefinitions,
      hasSchemaDefinitions: storedSchemaDefinitions !== null,
      isLoading,
    }),
    [getSchemaDefinitions, isLoading, storedSchemaDefinitions],
  );
};
