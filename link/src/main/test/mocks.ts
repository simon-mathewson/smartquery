import type { Connection } from '../types';

export const mocks = {
  connections: {
    mysql: {
      database: 'mysql_db',
      engine: 'mysql',
      id: 'mysql-connection',
      host: '0.0.0.0',
      name: 'MySQL',
      password: 'password',
      port: Number(import.meta.env.VITE_MYSQL_PORT),
      ssh: null,
      user: 'root',
    } satisfies Connection,
    postgres: {
      database: 'postgresql_db',
      host: '0.0.0.0',
      id: 'postgres-connection',
      engine: 'postgresql',
      name: 'Postgres',
      password: 'password',
      port: Number(import.meta.env.VITE_POSTGRESQL_PORT),
      ssh: null,
      user: 'postgres',
    } satisfies Connection,
  },
} as const;
