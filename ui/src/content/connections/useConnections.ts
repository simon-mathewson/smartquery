import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import type { ActiveConnection, Connection } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TrpcContext } from '../trpc/Context';
import { ToastContext } from '../toast/Context';
import { getInitialConnections } from './utils';

export const useConnections = (props: { signInModal: ModalControl<SignInModalInput> }) => {
  const { signInModal } = props;

  const navigate = useNavigate();

  const trpc = useDefinedContext(TrpcContext);

  const toast = useDefinedContext(ToastContext);

  const [connections, setConnections] = useStoredState<Connection[]>(
    'connections',
    getInitialConnections,
  );

  const [activeConnectionClientId, setActiveConnectionClientId] = useState<string | null>(null);

  const { connectionId: connectionIdParam, database: databaseParam } = useParams<{
    connectionId: string;
    database: string;
  }>();

  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

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
  }, [activeConnection, trpc]);

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
        await signInModal.open({
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
    [connections, disconnect, navigate, signInModal, toast, trpc.connectDb],
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

  const routeParams = useParams<{ connectionId?: string; database?: string }>();
  const previousRouteParamsRef = useRef<typeof routeParams | undefined>(undefined);

  // Disconnect when navigating to non-DB route
  useEffect(() => {
    const previousRouteParams = previousRouteParamsRef.current;
    previousRouteParamsRef.current = routeParams;

    if (!previousRouteParams) return;

    const { connectionId: previousConnectionId, database: previousDatabase } = previousRouteParams;
    const { connectionId: nextConnectionId, database: nextDatabase } = routeParams;

    if (
      previousConnectionId &&
      previousDatabase &&
      (nextConnectionId === undefined || nextDatabase === undefined)
    ) {
      void disconnect();
    }
  }, [disconnect, routeParams]);

  return useMemo(
    () => ({
      activeConnection,
      addConnection,
      connect,
      connections,
      removeConnection,
      updateConnection,
    }),
    [activeConnection, addConnection, connect, connections, removeConnection, updateConnection],
  );
};
