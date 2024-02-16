import { trpc } from '~/trpc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialConnections } from './initialConnections';
import { useLocalStorageState } from '~/shared/hooks/useLocalStorageState';
import type { ActiveConnection, Connection } from './types';

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

  useEffect(() => {
    const firstConnection = connections[0];

    if (!firstConnection) return;

    connect(firstConnection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
