import type { LegacyResults, Results } from '@/connector/types';
import { TRPCClientError } from '@trpc/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { SqliteContext } from '~/content/sqlite/Context';
import { getSelectFromStatement } from '~/content/tabs/queries/utils/parse';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { ActiveConnection, Database } from '~/shared/types';
import { LinkApiContext } from '../../link/api/Context';
import { ConnectionsContext } from '../Context';

export const useActiveConnection = () => {
  const toast = useDefinedContext(ToastContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);
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
          const results = await (currentConnection.connectedViaCloud
            ? cloudApi.connector.sendQuery.mutate
            : linkApi.sendQuery.mutate)({
            connectorId: currentConnection.connectorId,
            statements,
          });

          const isLegacy = Array.isArray(results.at(0));

          if (!isLegacy) return results as Exclude<Results, LegacyResults>;

          const convertedResults: Exclude<Results, LegacyResults> = (results as LegacyResults).map(
            (result) => ({
              fields: Object.keys(result[0]).map((key) => ({
                name: key,
                type: 'column-or-virtual',
              })),
              rows: result.map((row) => Object.values(row)),
            }),
          );

          return convertedResults;
        } catch (error) {
          console.error(error);

          if (
            error instanceof TRPCClientError &&
            (error.message.includes('Server has closed the connection.') ||
              error.message.includes("Can't reach database server at ") ||
              error.message.includes('Client not found'))
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

      const results: Results = statements.map((statement) => {
        const result = currentConnection.sqliteDb.exec(statement).at(0);

        return {
          fields:
            result?.columns.map((column) => ({ name: column, type: 'column-or-virtual' })) ?? [],
          rows: result?.values.map((row) => row.map((v) => (v === null ? null : String(v)))) ?? [],
        };
      });

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
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
      postgres: 'SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
    }[activeConnection.engine];

    const statements = [databasesStatement];

    if (activeConnection.engine === 'postgres') {
      statements.push(
        "SELECT schema_name, catalog_name FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
      );
    }

    setIsLoadingDatabases(true);

    try {
      await runQuery(statements).then(([dbResults, schemaResults]) => {
        setDatabases(
          dbResults.rows.map(([dbValue]) => {
            const db = String(dbValue);
            return {
              name: db,
              schemas:
                schemaResults?.rows
                  .filter(([_, schemaDb]) => db === String(schemaDb))
                  .map(([schema]) => String(schema)) ?? [],
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
