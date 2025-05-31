import type { Connection } from '../types';

export const mocks = {
  connections: {
    mysql: {
      database: 'mysql_db',
      engine: 'mysql',
      id: 'mysql-connection',
      host: 'localhost',
      name: 'MySQL',
      password: 'password',
      port: Number(import.meta.env.VITE_MYSQL_PORT),
      ssh: null,
      user: 'root',
    } satisfies Connection,
    postgres: {
      database: 'postgres_db',
      host: 'localhost',
      id: 'postgres-connection',
      engine: 'postgres',
      name: 'Postgres',
      password: 'password',
      port: Number(import.meta.env.VITE_POSTGRESQL_PORT),
      ssh: null,
      user: 'postgres',
    } satisfies Connection,
  },
} as const;
