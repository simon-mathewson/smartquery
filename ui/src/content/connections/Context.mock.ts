import { spy } from 'tinyspy';
import type { Connections } from './useConnections';
import type { ActiveConnection, Connection, FileConnection } from '~/shared/types';

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
  type: 'remote',
  user: 'user',
} satisfies Connection;

export const postgresqlConnectionMock = {
  credentialStorage: 'localStorage',
  database: 'postgres',
  engine: 'postgresql',
  host: '127.0.0.1',
  id: '2',
  name: 'PostgreSQL connection',
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
  type: 'remote',
  user: 'user',
} satisfies Connection;

export const sqliteConnectionMock = {
  database: 'development',
  engine: 'sqlite',
  id: '3',
  name: 'SQLite connection',
  type: 'file',
} satisfies FileConnection;

export const getConnectionsContextMock = () =>
  ({
    activeConnection: { clientId: '1', ...mysqlConnectionMock } as ActiveConnection,
    activeConnectionDatabases: [
      { name: 'development', schemas: [] },
      { name: 'test', schemas: [] },
      { name: 'staging', schemas: [] },
    ],
    addConnection: spy(),
    connect: spy(),
    connections: [mysqlConnectionMock, postgresqlConnectionMock, sqliteConnectionMock] as const,
    removeConnection: spy(),
    updateConnection: spy(),
  }) satisfies Connections;
