import { trpc } from '~/trpc';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
    async (id: string, overrides?: { database?: string; password?: string }) => {
      const connection = connections.find((c) => c.id === id);

      if (!connection) {
        throw new Error(`Connection with id ${id} not found`);
      }

      const password = overrides?.password ?? connection.password;

      if (password === null) {
        await signInModal.open({
          connection,
          onSignIn: async (password: string) =>
            connect(connection.id, { database: overrides?.database, password }),
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
