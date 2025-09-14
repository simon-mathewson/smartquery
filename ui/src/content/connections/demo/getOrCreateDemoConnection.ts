import type { Connection } from '@/connections/types';
import type { SqliteContextType } from '~/content/sqlite/Context';
import { demoConnectionId } from './constants';

export const getOrCreateDemoConnection = async (
  props: {
    connections: Connection[];
    addConnection: (
      connection: Connection,
      options?: { onSuccess?: () => void; skipToast?: boolean },
    ) => Promise<void>;
  } & Pick<SqliteContextType, 'storeSqliteContent'>,
): Promise<Connection> => {
  const { connections, addConnection, storeSqliteContent } = props;

  const demoConnection = connections.find((c) => c.id === demoConnectionId);

  if (demoConnection) {
    return demoConnection;
  }

  const response = await fetch('/demo.sqlite');
  const buffer = await response.arrayBuffer();
  await storeSqliteContent(buffer, demoConnectionId);

  const newDemoConnection = {
    database: 'demo',
    engine: 'sqlite',
    id: demoConnectionId,
    name: 'Demo',
    storageLocation: 'local',
    type: 'file',
  } satisfies Connection;

  await addConnection(newDemoConnection, { skipToast: true });

  return newDemoConnection;
};
