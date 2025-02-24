import { spy } from 'tinyspy';
import type { Connections } from './useConnections';
import type { ActiveConnection, Connection } from '~/shared/types';

export const connectionMock1 = {
  credentialStorage: 'alwaysAsk',
  database: 'development',
  engine: 'mysql',
  host: 'localhost',
  id: '1',
  name: 'Test connection',
  password: null,
  port: 1234,
  ssh: null,
  user: 'user',
} satisfies Connection;

export const connectionMock2 = {
  credentialStorage: 'localStorage',
  database: 'postgres',
  engine: 'postgresql',
  host: '127.0.0.1',
  id: '2',
  name: 'Other connection',
  password: 'password',
  port: 5248,
  schema: 'public',
  ssh: {
    credentialStorage: 'alwaysAsk',
    host: 'localhost',
    password: null,
    port: 22,
    user: 'ssh_user',
  },
  user: 'user',
} satisfies Connection;

export const getConnectionsContextMock = () =>
  ({
    activeConnection: { clientId: '1', ...connectionMock1 } as ActiveConnection,
    activeConnectionDatabases: [
      { name: 'development', schemas: [] },
      { name: 'test', schemas: [] },
      { name: 'staging', schemas: [] },
    ],
    addConnection: spy(),
    connect: spy(),
    connections: [connectionMock1, connectionMock2],
    removeConnection: spy(),
    updateConnection: spy(),
  }) satisfies Connections;
