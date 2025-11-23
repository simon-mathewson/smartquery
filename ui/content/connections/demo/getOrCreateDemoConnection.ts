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
  } & Pick<SqliteContextType, 'writeSqliteFile'>,
): Promise<Connection> => {
  const { connections, addConnection, writeSqliteFile } = props;

  const demoConnection = connections.find((c) => c.id === demoConnectionId);

  if (demoConnection) {
    return demoConnection;
  }

  const response = await fetch('/demo.sqlite');
  let binary = '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  await writeSqliteFile({ name: 'demo.sqlite', base64 }, demoConnectionId);

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
