import { trpc } from '~/trpc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialConnections } from './initialConnections';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import type { ActiveConnection, Connection } from '~/shared/types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';

export const useConnections = () => {
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

  const connect = useCallback(
    async (id: string, database?: string) => {
      const connection = connections.find((c) => c.id === id);

      if (!connection) {
        throw new Error(`Connection with id ${id} not found`);
      }

      if (activeConnection) {
        await trpc.disconnectDb.mutate(activeConnection.clientId);
      }

      setActiveConnectionClientId(null);

      const selectedDatabase = database ?? connection.database;

      const newClientId = await trpc.connectDb.mutate({
        ...connection,
        database: selectedDatabase,
      });

      setActiveConnectionClientId(newClientId);
      navigate(routes.database(connection.id, selectedDatabase));

      window.document.title = `${selectedDatabase} – ${connection.name}`;
    },
    [connections, activeConnection, navigate],
  );

  useEffectOnce(() => {
    if (activeConnectionId && activeConnectionDatabase) {
      connect(activeConnectionId, activeConnectionDatabase);
      return;
    }

    const firstConnectionId = connections.at(0)?.id;
    if (!firstConnectionId) return;

    connect(firstConnectionId);
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
