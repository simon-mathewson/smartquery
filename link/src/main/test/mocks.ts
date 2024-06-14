import type { Connection } from '../types';

export const mocks = {
  connection: {
    mysql: {
      database: 'mysql_db',
      engine: 'mysql',
      id: 'mysql-connection',
      host: 'localhost',
      name: 'Test Connection',
      password: 'password',
      port: Number(import.meta.env.VITE_MYSQL_PORT),
      ssh: null,
      user: 'root',
    } satisfies Connection,
    postgres: {
      database: 'postgresql_db',
      host: 'localhost',
      id: 'postgres-connection',
      engine: 'postgresql',
      name: 'Test Connection',
      password: 'password',
      port: Number(import.meta.env.VITE_POSTGRESQL_PORT),
      ssh: null,
      user: 'postgres',
    } satisfies Connection,
  },
} as const;
