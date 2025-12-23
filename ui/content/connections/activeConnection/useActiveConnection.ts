import type { LegacyResults, NewResults, Results } from '@/connector/types';
import { ConnectorNotFoundError } from '@/errors/ConnectorNotFoundError';
import { NoLongerConnectedError } from '@/errors/NoLongerConnectedError';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { SqliteContext } from '~/content/sqlite/Context';
import type { SqliteFile } from '~/content/sqlite/useSqlite';
import { getSelectFromStatement } from '~/content/tabs/queries/utils/parse';
import { ToastContext } from '~/content/toast/Context';
import { getErrorMessage } from '~/shared/components/sqlEditor/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useNative } from '~/shared/hooks/useNative/useNative';
import type { ActiveConnection, Database } from '~/shared/types';
import { LinkApiContext } from '../../link/api/Context';
import { ConnectionsContext } from '../Context';

export const useActiveConnection = () => {
  const toast = useDefinedContext(ToastContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const linkApi = useDefinedContext(LinkApiContext);
  const { activeConnection, connect } = useDefinedContext(ConnectionsContext);
  const { getSqliteFile, requestFileHandlePermission, writeSqliteFile } =
    useDefinedContext(SqliteContext);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

  const native = useNative();

  const runQuery = useCallback(
    async (
      statements: string[],
      options?: { overrideActiveConnection?: ActiveConnection; skipSqliteWrite?: boolean },
    ) => {
      const currentConnection = options?.overrideActiveConnection ?? activeConnection;

      assert(currentConnection);

      if (currentConnection.engine !== 'sqlite') {
        try {
          const endpoint = (() => {
            if (currentConnection.connectedViaCloud) {
              return cloudApi.connector.sendQuery.mutate;
            }

            if (window.ReactNativeWebView) {
              return native.runQuery;
            }

            return linkApi.sendQuery.mutate;
          })();

          const results = await endpoint({
            connectorId: currentConnection.connectorId,
            statements,
          });

          const isLegacy = Array.isArray(results.at(0));

          if (!isLegacy) return results as NewResults;

          const convertedResults: NewResults = (results as LegacyResults).map((result) => ({
            fields: result.length
              ? Object.keys(result[0]).map((key) => ({
                  name: key,
                  type: 'column-or-virtual',
                }))
              : [],
            rows: result.map((row) =>
              Object.values(row).map((v) => (v === null ? null : String(v))),
            ),
          }));

          return convertedResults;
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message === NoLongerConnectedError.code ||
              error.message === ConnectorNotFoundError.code)
          ) {
            const newConnection = await connect(currentConnection.id, {
              database: currentConnection.database,
              schema: currentConnection.schema,
            });

            if (newConnection) {
              toast.add({
                color: 'success',
                title: 'Reconnected successfully',
              });

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

      let sqliteFile: SqliteFile | null = null;

      const hasOnlySelectStatements = await Promise.all(
        statements.map((statement) =>
          getSelectFromStatement({ connection: currentConnection, statement }),
        ),
      ).then((results) => results.every((result) => result !== null));

      if (!hasOnlySelectStatements && !options?.skipSqliteWrite) {
        sqliteFile = await getSqliteFile(currentConnection.id);

        if (sqliteFile instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(sqliteFile);
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

      if (sqliteFile) {
        const updatedDb = currentConnection.sqliteDb.export();

        if (sqliteFile instanceof FileSystemFileHandle) {
          const writable = await sqliteFile.createWritable();
          await writable.write(updatedDb);
          await writable.close();
        } else {
          let binary = '';
          updatedDb.forEach((b) => (binary += String.fromCharCode(b)));
          const base64 = btoa(binary);
          await writeSqliteFile({ ...sqliteFile, base64 }, currentConnection.id);
        }
      }

      return results;
    },
    [
      activeConnection,
      cloudApi,
      connect,
      getSqliteFile,
      linkApi,
      requestFileHandlePermission,
      writeSqliteFile,
      toast,
      native,
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
