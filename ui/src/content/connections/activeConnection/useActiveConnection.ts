import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Database } from '~/shared/types';
import { LinkApiContext } from '../../link/api/Context';
import { ConnectionsContext } from '../Context';

export const useActiveConnection = () => {
  const linkApi = useDefinedContext(LinkApiContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

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
      await linkApi.sendQuery
        .mutate({ clientId: activeConnection.clientId, statements })
        .then(([dbRows, schemaRows]) => {
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
  }, [linkApi.sendQuery, activeConnection]);

  useEffect(() => {
    if (activeConnection) {
      getDatabases();
    } else {
      setDatabases([]);
    }
  }, [activeConnection, getDatabases]);

  return useMemo(
    () => (activeConnection ? { activeConnection, databases, isLoadingDatabases } : null),
    [activeConnection, databases, isLoadingDatabases],
  );
};
