import { spy } from 'tinyspy';
import type { UseConnections } from './useConnections';
import type { Connection } from '~/shared/types';

const connection1 = {
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

const connection2 = {
  credentialStorage: 'localStorage',
  database: 'postgres',
  engine: 'postgresql',
  host: '127.0.0.1',
  id: '2',
  name: 'Other connection',
  password: 'password',
  port: 5248,
  ssh: {
    credentialStorage: 'alwaysAsk',
    host: 'localhost',
    password: null,
    port: 22,
    user: 'ssh_user',
  },
  user: 'user',
} satisfies Connection;

export const connectionsContextMock = {
  activeConnection: { clientId: '1', ...connection1 },
  activeConnectionDatabases: ['development', 'test', 'staging'],
  addConnection: spy(),
  connect: spy(),
  connections: [connection1, connection2],
  removeConnection: spy(),
  updateConnection: spy(),
} satisfies UseConnections;
