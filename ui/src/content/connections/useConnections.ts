import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ActiveConnection, Connection, Database } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useLocation, useRoute } from 'wouter';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkApiContext } from '../link/api/Context';
import { ToastContext } from '../toast/Context';
import { SqliteContext } from '../sqlite/Context';
import { assert } from 'ts-essentials';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { CloudApiContext } from '../cloud/api/Context';
import { sortBy } from 'lodash';
import { mapCloudConnectionToClient } from './mapCloudConnectionToClient';
import { AuthContext } from '../auth/Context';

export type Connections = ReturnType<typeof useConnections>;

export type UseConnectionsProps = { signInModal: ModalControl<SignInModalInput> };

export const useConnections = (props: UseConnectionsProps) => {
  const { signInModal } = props;

  const [, navigate] = useLocation();

  const cloudApi = useDefinedContext(CloudApiContext);
  const linkApi = useDefinedContext(LinkApiContext);
  const { user } = useDefinedContext(AuthContext);
  const toast = useDefinedContext(ToastContext);
  const { getSqliteDb } = useDefinedContext(SqliteContext);

  const [localConnections, setLocalConnections] = useStoredState<Connection[]>(
    'connections',
    [],
    undefined,
    [
      (storedConnections) =>
        storedConnections.map((connection) => ({
          ...connection,
          storageLocation: connection.storageLocation ?? 'local',
        })),
    ],
  );

  const [cloudConnections] = useCloudQuery(() => cloudApi.connections.list.query(), {
    disabled: !user,
  });

  const connections = useMemo(
    () =>
      sortBy(
        [...localConnections, ...(cloudConnections?.map(mapCloudConnectionToClient) ?? [])],
        (c) => c.name.toLowerCase(),
      ),
    [localConnections, cloudConnections],
  );

  const [, dbRouteParamsWithoutSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: undefined;
  }>(routes.database({ schema: '' }));

  const [, dbRouteParamsWithSchema] = useRoute<{
    connectionId: string;
    database: string;
    schema: string;
  }>(routes.database());

  const dbRouteParams = dbRouteParamsWithSchema ?? dbRouteParamsWithoutSchema;

  const {
    connectionId: connectionIdParam,
    database: databaseParam,
    schema: schemaParam,
  } = dbRouteParams ?? {};

  const previousRouteParamsRef = useRef<typeof dbRouteParams | undefined>(undefined);

  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  const [activeConnectionDatabases, setActiveConnectionDatabases] = useState<Database[]>([]);

  const addConnection = useCallback(
    (connection: Connection) => {
      setLocalConnections([...localConnections, connection]);
    },
    [localConnections, setLocalConnections],
  );

  const updateConnection = useCallback(
    (id: string, connection: Connection) => {
      setLocalConnections(localConnections.map((c) => (c.id === id ? connection : c)));
    },
    [localConnections, setLocalConnections],
  );

  const disconnect = useCallback(async () => {
    if (!activeConnection) return;

    if (activeConnection.type === 'remote') {
      await linkApi.disconnectDb.mutate(activeConnection.clientId);
    } else {
      activeConnection.sqliteDb.close();
    }

    setActiveConnection(null);
    setActiveConnectionDatabases([]);
  }, [activeConnection, linkApi]);

  const removeConnection = useCallback(
    (id: string) => {
      setLocalConnections(localConnections.filter((c) => c.id !== id));

      if (activeConnection?.id === id) {
        void disconnect();
        navigate(routes.root());
      }
    },
    [setLocalConnections, localConnections, activeConnection?.id, disconnect, navigate],
  );

  const getDatabases = useCallback(
    async (connection: Connection, clientId?: string) => {
      if (connection.engine === 'sqlite') {
        return setActiveConnectionDatabases([{ name: connection.database, schemas: [] }]);
      }

      assert(clientId);

      const databasesStatement = {
        mysql:
          "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
        postgres:
          'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
      }[connection.engine];

      const statements = [databasesStatement];

      if (connection.engine === 'postgres') {
        statements.push(
          "SELECT schema_name AS schema, catalog_name AS db FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
        );
      }

      await linkApi.sendQuery.mutate({ clientId, statements }).then(([dbRows, schemaRows]) => {
        setActiveConnectionDatabases(
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
    },
    [linkApi.sendQuery],
  );

  const connect = useCallback(
    async (
      id: string,
      overrides?: {
        database?: string;
        schema?: string;
      },
    ) => {
      const connection = connections.find((c) => c.id === id);

      if (!connection) {
        toast.add({ color: 'danger', title: `Connection with id ${id} not found` });
        navigate(routes.root());
        return;
      }

      await disconnect();

      if (connection.type === 'file') {
        const sqliteDb = await getSqliteDb(connection.id);
        const activeConnection = {
          ...connection,
          sqliteDb,
        } satisfies ActiveConnection;

        setActiveConnection(activeConnection);

        await getDatabases(connection);
      }

      const selectedDatabase = overrides?.database ?? connection.database;
      const selectedSchema =
        overrides?.schema ?? (connection.type === 'remote' ? connection.schema : undefined);

      try {
        const newClientId = await (async () => {
          if (connection.engine === 'sqlite') {
            return undefined;
          }

          const { password, sshPassword, sshPrivateKey } = await (async () => {
            const storedCredentials = {
              password: connection.password ?? '',
              sshPassword: connection.ssh?.password ?? undefined,
              sshPrivateKey: connection.ssh?.privateKey ?? undefined,
            };

            if (
              connection.password === null ||
              connection.ssh?.password === null ||
              connection.ssh?.privateKey === null
            ) {
              return new Promise<{
                password: string;
                sshPassword: string | undefined;
                sshPrivateKey: string | undefined;
              }>((resolve) => {
                signInModal.open({
                  connection,
                  onSignIn: async (enteredCredentials) =>
                    resolve({
                      password: enteredCredentials.password ?? storedCredentials.password,
                      sshPassword: enteredCredentials.sshPassword ?? storedCredentials.sshPassword,
                      sshPrivateKey:
                        enteredCredentials.sshPrivateKey ?? storedCredentials.sshPrivateKey,
                    }),
                });
              });
            }

            return storedCredentials;
          })();

          const newClientId = await linkApi.connectDb.mutate({
            ...connection,
            database: selectedDatabase,
            password,
            schema: selectedSchema,
            ssh: connection.ssh
              ? {
                  ...connection.ssh,
                  password: sshPassword,
                  privateKey: sshPrivateKey,
                }
              : null,
          });

          setActiveConnection({
            ...connection,
            clientId: newClientId,
            database: selectedDatabase,
            schema: selectedSchema,
          } satisfies ActiveConnection);

          return newClientId;
        })();

        navigate(
          routes.database({
            connectionId: connection.id,
            database: selectedDatabase,
            schema: selectedSchema ?? '',
          }),
        );

        window.document.title = `${
          selectedSchema ? `${selectedSchema} – ` : ''
        }${selectedDatabase} – ${connection.name}`;

        await getDatabases(connection, newClientId);
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          description: (error as Error).message,
          title: 'Failed to connect to database',
        });

        navigate(routes.root());
      }
    },
    [
      connections,
      disconnect,
      getDatabases,
      getSqliteDb,
      navigate,
      signInModal,
      toast,
      linkApi.connectDb,
    ],
  );

  useEffectOnce(() => {
    if (connectionIdParam) {
      connect(connectionIdParam, { database: databaseParam, schema: schemaParam });
      return;
    }
  });

  // Disconnect when closing tab
  useEffect(() => {
    window.addEventListener('beforeunload', disconnect);

    return () => {
      window.removeEventListener('beforeunload', disconnect);
    };
  }, [disconnect]);

  // Disconnect when navigating to non-DB route
  useEffect(() => {
    const previousRouteParams = previousRouteParamsRef.current;
    previousRouteParamsRef.current = dbRouteParams;

    if (!previousRouteParams) return;

    const { connectionId: previousConnectionId, database: previousDatabase } = previousRouteParams;
    const { connectionId: nextConnectionId, database: nextDatabase } = dbRouteParams ?? {};

    if (
      previousConnectionId &&
      previousDatabase &&
      (nextConnectionId === undefined || nextDatabase === undefined)
    ) {
      void disconnect();
    }
  }, [disconnect, dbRouteParams]);

  return useMemo(
    () => ({
      activeConnection,
      activeConnectionDatabases,
      addConnection,
      connect,
      connections,
      removeConnection,
      updateConnection,
    }),
    [
      activeConnection,
      activeConnectionDatabases,
      addConnection,
      connect,
      connections,
      removeConnection,
      updateConnection,
    ],
  );
};
