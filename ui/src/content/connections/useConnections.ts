import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ActiveConnection, Connection, Engine } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useLocation, useRoute } from 'wouter';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TrpcContext } from '../trpc/Context';
import { ToastContext } from '../toast/Context';
import { getInitialConnections } from './utils';

export type UseConnections = ReturnType<typeof useConnections>;

export const useConnections = (props: { signInModal: ModalControl<SignInModalInput> }) => {
  const { signInModal } = props;

  const [, navigate] = useLocation();

  const trpc = useDefinedContext(TrpcContext);

  const toast = useDefinedContext(ToastContext);

  const [connections, setConnections] = useStoredState<Connection[]>(
    'connections',
    getInitialConnections,
  );

  const [activeConnectionClientId, setActiveConnectionClientId] = useState<string | null>(null);

  const [, dbRouteParams] = useRoute<{
    connectionId: string;
    database: string;
  }>(routes.database());

  const { connectionId: connectionIdParam, database: databaseParam } = dbRouteParams ?? {};

  const previousRouteParamsRef = useRef<typeof dbRouteParams | undefined>(undefined);

  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  const [activeConnectionDatabases, setActiveConnectionDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnectionClientId || !connectionIdParam || !databaseParam) return;

    const connection = connections.find((c) => c.id === connectionIdParam) ?? null;
    if (!connection) return;

    setActiveConnection({
      ...connection,
      clientId: activeConnectionClientId,
      database: databaseParam,
    } satisfies ActiveConnection);
  }, [activeConnectionClientId, databaseParam, connectionIdParam, connections]);

  const addConnection = useCallback(
    (connection: Omit<Connection, 'id'>) => {
      setConnections([
        ...connections,
        {
          ...connection,
          id: String(connections.length),
        },
      ]);
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

    await trpc.disconnectDb.mutate(activeConnection.clientId);

    setActiveConnectionClientId(null);
    setActiveConnection(null);
    setActiveConnectionDatabases([]);
  }, [activeConnection, trpc]);

  const getDatabases = useCallback(
    async (clientId: string, engine: Engine) => {
      const databasesStatement = {
        mysql:
          "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
        postgresql:
          'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
      }[engine];

      return trpc.sendQuery
        .mutate({ clientId, statements: [databasesStatement] })
        .then(([rows]) => {
          setActiveConnectionDatabases(rows.map(({ db }) => String(db)));
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

      const password = overrides?.password ?? connection.password;
      const sshPassword = overrides?.sshPassword ?? connection.ssh?.password;
      const sshPrivateKey = overrides?.sshPrivateKey ?? connection.ssh?.privateKey;

      if (password === null || sshPassword === null || sshPrivateKey === null) {
        signInModal.open({
          connection,
          onSignIn: async (credentials) =>
            connect(connection.id, {
              database: overrides?.database,
              ...credentials,
            }),
        });
        return;
      }

      await disconnect();

      const selectedDatabase = overrides?.database ?? connection.database;

      try {
        const newClientId = await trpc.connectDb.mutate({
          ...connection,
          database: selectedDatabase,
          password,
          ssh: connection.ssh
            ? {
                ...connection.ssh,
                password: sshPassword,
                privateKey: sshPrivateKey,
              }
            : null,
        });

        setActiveConnectionClientId(newClientId);

        navigate(routes.database(connection.id, selectedDatabase));
        window.document.title = `${selectedDatabase} – ${connection.name}`;

        await getDatabases(newClientId, connection.engine);
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
    [connections, disconnect, getDatabases, navigate, signInModal, toast, trpc.connectDb],
  );

  useEffectOnce(() => {
    if (connectionIdParam && databaseParam) {
      connect(connectionIdParam, { database: databaseParam });
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
