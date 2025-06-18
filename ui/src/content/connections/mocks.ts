import type { Connection, FileConnection } from '@/types/connection';
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

export const getContextMock = () =>
  ({
    activeConnection: { clientId: '1', ...mysqlConnectionMock } as ActiveConnection,
    activeConnectionDatabases: [
      { name: 'development', schemas: [] },
      { name: 'test', schemas: [] },
      { name: 'staging', schemas: [] },
    ],
    addConnection: spy(),
    connect: spy(),
    connectRemote: spy(),
    connections: [mysqlConnectionMock, postgresConnectionMock, sqliteConnectionMock] as const,
    disconnectRemote: spy(),
    removeConnection: spy(),
    updateConnection: spy(),
  }) satisfies Connections;
