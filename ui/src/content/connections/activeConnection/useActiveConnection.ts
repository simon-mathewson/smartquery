import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Database, DbValue } from '~/shared/types';
import { LinkApiContext } from '../../link/api/Context';
import { ConnectionsContext } from '../Context';
import { SqliteContext } from '~/content/sqlite/Context';
import { convertSqliteResultsToRecords } from './convertSqliteResultsToRecords';
import { getSelectFromStatement } from '~/content/tabs/queries/utils/parse';

export const useActiveConnection = () => {
  const linkApi = useDefinedContext(LinkApiContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { getSqliteContent, requestFileHandlePermission, storeSqliteContent } =
    useDefinedContext(SqliteContext);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

  const runQuery = useCallback(
    async (statements: string[], options?: { skipSqliteWrite?: boolean }) => {
      assert(activeConnection);

      if (activeConnection.engine !== 'sqlite') {
        return linkApi.sendQuery.mutate({
          clientId: activeConnection.clientId,
          statements,
        });
      }

      let fileHandle: FileSystemFileHandle | ArrayBuffer | null = null;

      const hasOnlySelectStatements = statements.every((statement) =>
        getSelectFromStatement({ connection: activeConnection, statement }),
      );

      if (!hasOnlySelectStatements && !options?.skipSqliteWrite) {
        fileHandle = await getSqliteContent(activeConnection.id);

        if (fileHandle instanceof FileSystemFileHandle) {
          await requestFileHandlePermission(fileHandle);
        }
      }

      const results = convertSqliteResultsToRecords(
        statements.map((statement) => activeConnection.sqliteDb.exec(statement)[0]),
      ) as Record<string, DbValue>[][];

      if (fileHandle) {
        const updatedDb = activeConnection.sqliteDb.export();

        if (fileHandle instanceof FileSystemFileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(updatedDb);
          await writable.close();
        } else {
          await storeSqliteContent(updatedDb, activeConnection.id);
        }
      }

      return results;
    },
    [
      activeConnection,
      getSqliteContent,
      linkApi.sendQuery,
      requestFileHandlePermission,
      storeSqliteContent,
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
      getDatabases();
    } else {
      setDatabases([]);
    }
  }, [activeConnection, getDatabases]);

  return useMemo(
    () => (activeConnection ? { activeConnection, databases, isLoadingDatabases, runQuery } : null),
    [activeConnection, databases, isLoadingDatabases, runQuery],
  );
};
