import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { ActiveConnection, Database, DbValue } from '~/shared/types';
import { LinkApiContext } from '../../link/api/Context';
import { ConnectionsContext } from '../Context';
import { SqliteContext } from '~/content/sqlite/Context';
import { convertSqliteResultsToRecords } from './convertSqliteResultsToRecords';
import { getSelectFromStatement } from '~/content/tabs/queries/utils/parse';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { TRPCClientError } from '@trpc/client';
import { CloudApiContext } from '~/content/cloud/api/Context';

export const useActiveConnection = () => {
  const toast = useDefinedContext(ToastContext);
  const cloudApi = useDefinedContext(CloudApiContext);
  const linkApi = useDefinedContext(LinkApiContext);
  const { activeConnection, connect } = useDefinedContext(ConnectionsContext);
  const { getSqliteContent, requestFileHandlePermission, storeSqliteContent } =
    useDefinedContext(SqliteContext);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

  const runQuery = useCallback(
    async (
      statements: string[],
      options?: { overrideActiveConnection?: ActiveConnection; skipSqliteWrite?: boolean },
    ) => {
      const currentConnection = options?.overrideActiveConnection ?? activeConnection;

      assert(currentConnection);

      if (currentConnection.engine !== 'sqlite') {
        try {
          const endpoint = currentConnection.connectedViaCloud
            ? cloudApi.connector.sendQuery.mutate
            : linkApi.sendQuery.mutate;

          return await endpoint({
            connectorId: currentConnection.connectorId,
            statements,
          });
        } catch (error) {
          console.error(error);

          if (
            error instanceof TRPCClientError &&
            (error.message.includes('Server has closed the connection.') ||
              error.message.includes("Can't reach database server at ") ||
              error.message.includes('Client not found') ||
              error.message.includes(
                "Cannot destructure property 'prisma' of 'client' as it is undefined.",
              ))
          ) {
            const newConnection = await connect(currentConnection.id, {
              database: currentConnection.database,
              schema: currentConnection.schema,
            });

            if (newConnection) {
              return runQuery(statements, { overrideActiveConnection: newConnection });
            } else {
              throw error;
            }
          }

          if (error instanceof Error) {
            toast.add({
              color: 'danger',
              description: getErrorMessage(error),
              title: 'Query failed',
            });
          }

          throw error;
        }
      }

      let fileHandle: FileSystemFileHandle | ArrayBuffer | null = null;

      const hasOnlySelectStatements = await Promise.all(
        statements.map((statement) =>
          getSelectFromStatement({ connection: currentConnection, statement }),
        ),
      ).then((results) => results.every((result) => result !== null));

      if (!hasOnlySelectStatements && !options?.skipSqliteWrite) {
        fileHandle = await getSqliteContent(currentConnection.id);

        if (fileHandle instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(fileHandle);
        }
      }

      const results = convertSqliteResultsToRecords(
        statements.map((statement) => currentConnection.sqliteDb.exec(statement)[0]),
      ) as Record<string, DbValue>[][];

      if (fileHandle) {
        const updatedDb = currentConnection.sqliteDb.export();

        if (fileHandle instanceof FileSystemFileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(updatedDb);
          await writable.close();
        } else {
          await storeSqliteContent(updatedDb, currentConnection.id);
        }
      }

      return results;
    },
    [
      activeConnection,
      cloudApi,
      connect,
      getSqliteContent,
      linkApi,
      requestFileHandlePermission,
      storeSqliteContent,
      toast,
    ],
  );

  const getDatabases = useCallback(async () => {
    assert(activeConnection);

    if (activeConnection.engine === 'sqlite') {
      return setDatabases([{ name: activeConnection.database, schemas: [] }]);
    }

    const databasesStatement = {
      mysql:
        "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
      postgres:
        'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
    }[activeConnection.engine];

    const statements = [databasesStatement];

    if (activeConnection.engine === 'postgres') {
      statements.push(
        "SELECT schema_name AS schema, catalog_name AS db FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
      );
    }

    setIsLoadingDatabases(true);

    try {
      await runQuery(statements).then(([dbRows, schemaRows]) => {
        setDatabases(
          dbRows.map((dbRow) => {
            const db = String(dbRow.db);
            return {
              name: db,
              schemas:
                schemaRows
                  ?.filter((schemaRow) => db === String(schemaRow.db))
                  .map((schemaRow) => String(schemaRow.schema)) ?? [],
            };
          }),
        );
      });
    } finally {
      setIsLoadingDatabases(false);
    }
  }, [activeConnection, runQuery]);

  useEffect(() => {
    if (activeConnection) {
      void getDatabases();
    } else {
      setDatabases([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  return useMemo(
    () => (activeConnection ? { activeConnection, databases, isLoadingDatabases, runQuery } : null),
    [activeConnection, databases, isLoadingDatabases, runQuery],
  );
};
