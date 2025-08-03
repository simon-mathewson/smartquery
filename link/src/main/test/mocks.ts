import type { RemoteConnection } from '@/connections/types';

export const mocks = {
  connections: {
    mysql: {
      credentialStorage: 'plain',
      database: 'mysql_db',
      engine: 'mysql',
      id: 'mysql-connection',
      host: 'localhost',
      name: 'MySQL',
      password: 'password',
      port: Number(import.meta.env.VITE_MYSQL_PORT),
      ssh: null,
      storageLocation: 'local',
      type: 'remote',
      user: 'root',
    } satisfies RemoteConnection,
    postgres: {
      credentialStorage: 'plain',
      database: 'postgres_db',
      host: 'localhost',
      id: 'postgres-connection',
      engine: 'postgres',
      name: 'Postgres',
      password: 'password',
      port: Number(import.meta.env.VITE_POSTGRES_PORT),
      ssh: null,
      storageLocation: 'local',
      type: 'remote',
      user: 'postgres',
    } satisfies RemoteConnection,
  },
} as const;
