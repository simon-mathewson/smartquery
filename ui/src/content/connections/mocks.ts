import type { Connection, FileConnection } from '@/connections/types';
import { spy } from 'tinyspy';
import type { ActiveConnection } from '~/shared/types';
import type { Connections } from './useConnections';

export const mysqlConnectionMock = {
  credentialStorage: 'alwaysAsk',
  database: 'development',
  engine: 'mysql',
  host: 'localhost',
  id: '1',
  name: 'MySQL connection',
  password: null,
  port: 1234,
  ssh: null,
  storageLocation: 'local',
  type: 'remote',
  user: 'user',
} satisfies Connection;

export const postgresConnectionMock = {
  credentialStorage: 'plain',
  database: 'postgres',
  engine: 'postgres',
  host: '127.0.0.1',
  id: '2',
  name: 'PostgreSQL connection',
  password: 'password',
  port: 5248,
  schema: 'public',
  ssh: {
    host: 'localhost',
    password: null,
    port: 22,
    user: 'ssh_user',
  },
  storageLocation: 'local',
  type: 'remote',
  user: 'user',
} satisfies Connection;

export const sqliteConnectionMock = {
  database: 'development',
  engine: 'sqlite',
  id: '3',
  name: 'SQLite connection',
  storageLocation: 'local',
  type: 'file',
} satisfies FileConnection;

export const getConnectionsMock = () =>
  ({
    activeConnection: {
      connectedViaCloud: false,
      connectorId: '1',
      ...mysqlConnectionMock,
    } as ActiveConnection,
    addConnection: spy(),
    connect: spy(),
    connectRemote: spy(),
    connectViaCloud: false,
    connections: [mysqlConnectionMock, postgresConnectionMock, sqliteConnectionMock] as const,
    disconnectRemote: spy(),
    removeConnection: spy(),
    setConnectViaCloud: spy(),
    updateConnection: spy(),
  }) satisfies Connections;
