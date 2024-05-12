import { trpc } from '~/trpc';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialConnections } from './initialConnections';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import type { ActiveConnection, Connection } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './signInModal/types';

export const useConnections = (props: { signInModal: ModalControl<SignInModalInput> }) => {
  const { signInModal } = props;

  const navigate = useNavigate();

  const [connections, setConnections] = useStoredState<Connection[]>(
    'connections',
    initialConnections,
  );

  const [activeConnectionClientId, setActiveConnectionClientId] = useState<string | null>(null);

  const { connectionId: activeConnectionId, database: activeConnectionDatabase } = useParams<{
    connectionId: string;
    database: string;
  }>();

  const activeConnection = useMemo(() => {
    if (!activeConnectionClientId || !activeConnectionDatabase) return null;

    const connection = connections.find((c) => c.id === activeConnectionId) ?? null;
    if (!connection) return null;

    return {
      ...connection,
      clientId: activeConnectionClientId,
      database: activeConnectionDatabase,
    } satisfies ActiveConnection;
  }, [activeConnectionClientId, activeConnectionDatabase, activeConnectionId, connections]);

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
        throw new Error(`Connection with id ${id} not found`);
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

      if (activeConnection) {
        await trpc.disconnectDb.mutate(activeConnection.clientId);
      }

      setActiveConnectionClientId(null);

      const selectedDatabase = overrides?.database ?? connection.database;

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
    },
    [connections, activeConnection, navigate, signInModal],
  );

  useEffectOnce(() => {
    if (activeConnectionId && activeConnectionDatabase) {
      connect(activeConnectionId, { database: activeConnectionDatabase });
      return;
    }
  });

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (activeConnection) {
        await trpc.disconnectDb.mutate(activeConnection.clientId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeConnection]);

  const routeParams = useParams<{ connectionId?: string; database?: string }>();
  const previousRouteParamsRef = useRef<typeof routeParams | undefined>(undefined);

  useEffect(() => {
    const previousRouteParams = previousRouteParamsRef.current;
    previousRouteParamsRef.current = routeParams;

    if (!previousRouteParams) return;

    const { connectionId: previousConnectionId, database: previousDatabase } = previousRouteParams;
    const { connectionId: nextConnectionId, database: nextDatabase } = routeParams;

    if (
      previousConnectionId &&
      previousDatabase &&
      (previousConnectionId !== nextConnectionId || previousDatabase !== nextDatabase)
    ) {
      if (activeConnection) {
        trpc.disconnectDb.mutate(activeConnection.clientId);
      }
    }
  }, [activeConnection, routeParams]);

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
