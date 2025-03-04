import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ActiveConnection, Connection, Database } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useLocation, useRoute } from 'wouter';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TrpcContext } from '../trpc/Context';
import { ToastContext } from '../toast/Context';
import { getInitialConnections } from './utils';
import { SqliteContext } from '../sqlite/Context';
import { getFileHandle, requestFileHandlePermission } from '~/shared/utils/fileHandles/fileHandles';
import { assert } from 'ts-essentials';

export type Connections = ReturnType<typeof useConnections>;

export type UseConnectionsProps = { signInModal: ModalControl<SignInModalInput> };

export const useConnections = (props: UseConnectionsProps) => {
  const { signInModal } = props;

  const [, navigate] = useLocation();

  const trpc = useDefinedContext(TrpcContext);

  const toast = useDefinedContext(ToastContext);

  const { getSqlite } = useDefinedContext(SqliteContext);

  const [connections, setConnections] = useStoredState<Connection[]>(
    'connections',
    getInitialConnections,
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
      setConnections([...connections, connection]);
    },
    [connections, setConnections],
  );

  const removeConnection = useCallback(
    (id: string) => {
      setConnections(connections.filter((c) => c.id !== id));
    },
    [connections, setConnections],
  );

  const updateConnection = useCallback(
    (id: string, connection: Connection) => {
      setConnections(connections.map((c) => (c.id === id ? connection : c)));
    },
    [connections, setConnections],
  );

  const disconnect = useCallback(async () => {
    if (!activeConnection) return;

    if (activeConnection.type === 'remote') {
      await trpc.disconnectDb.mutate(activeConnection.clientId);
    } else {
      activeConnection.sqliteDb.close();
    }

    setActiveConnection(null);
    setActiveConnectionDatabases([]);
  }, [activeConnection, trpc]);

  const getDatabases = useCallback(
    async (connection: Connection, clientId?: string) => {
      if (connection.engine === 'sqlite') {
        return setActiveConnectionDatabases([{ name: connection.database, schemas: [] }]);
      }

      assert(clientId);

      const databasesStatement = {
        mysql:
          "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
        postgresql:
          'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
      }[connection.engine];

      const statements = [databasesStatement];

      if (connection.engine === 'postgresql') {
        statements.push(
          "SELECT schema_name AS schema, catalog_name AS db FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name NOT LIKE 'pg_%' ORDER BY schema_name ASC",
        );
      }

      await trpc.sendQuery.mutate({ clientId, statements }).then(([dbRows, schemaRows]) => {
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
    [trpc.sendQuery],
  );

  const connect = useCallback(
    async (
      id: string,
      overrides?: {
        database?: string;
        password?: string;
        schema?: string;
        sshPassword?: string;
        sshPrivateKey?: string;
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
        const sqlite = await getSqlite();
        const fileHandle = await getFileHandle(connection.id);
        const permissionGranted = await requestFileHandlePermission(fileHandle, toast);

        if (!permissionGranted) return;

        const file = await fileHandle.getFile();
        const fileBuffer = await file.arrayBuffer();

        const sqliteDb = new sqlite.Database(new Uint8Array(fileBuffer));

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

          const password = overrides?.password ?? connection.password;
          const sshPassword = overrides?.sshPassword ?? connection.ssh?.password;
          const sshPrivateKey = overrides?.sshPrivateKey ?? connection.ssh?.privateKey;

          if (password === null || sshPassword === null || sshPrivateKey === null) {
            signInModal.open({
              connection,
              onSignIn: async (credentials) =>
                connect(connection.id, {
                  database: overrides?.database,
                  schema: overrides?.schema,
                  ...credentials,
                }),
            });
            return;
          }
          const newClientId = await trpc.connectDb.mutate({
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
      getSqlite,
      navigate,
      signInModal,
      toast,
      trpc.connectDb,
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
