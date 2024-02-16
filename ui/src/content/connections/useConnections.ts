import { trpc } from '~/trpc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialConnections } from './initialConnections';
import { useLocalStorageState } from '~/shared/hooks/useLocalStorageState';
import type { ActiveConnection, Connection } from './types';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const useConnections = () => {
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);

  const [connections, setConnections] = useLocalStorageState<Connection[]>(
    'connections',
    initialConnections,
  );

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
    async (connection: Connection) => {
      if (activeConnection) {
        await trpc.disconnectDb.mutate(activeConnection.clientId);
      }

      setActiveConnection(null);

      const newClientId = await trpc.connectDb.mutate(connection);

      setActiveConnection({
        ...connection,
        clientId: newClientId,
      });

      window.document.title = `${connection.database} – ${connection.name}`;
    },
    [activeConnection],
  );

  useEffectOnce(() => {
    const firstConnection = connections[0];

    if (!firstConnection) return;

    connect(firstConnection);
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
