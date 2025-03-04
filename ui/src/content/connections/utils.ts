import type { Connection } from '~/shared/types';

export const getCredentialUsername = (connection: { user: string; host: string; port: number }) =>
  `${connection.user}@${connection.host}:${connection.port}`;

export const getInitialConnections = (): Connection[] =>
  import.meta.env.DEV
    ? [
        {
          credentialStorage: 'localStorage',
          database: 'mysql_db',
          engine: 'mysql',
          id: 'mysql-connection',
          host: 'localhost',
          name: 'MySQL',
          password: 'password',
          port: Number(import.meta.env.VITE_MYSQL_PORT),
          ssh: null,
          type: 'remote',
          user: 'root',
        },
        {
          credentialStorage: 'localStorage',
          database: 'postgresql_db',
          host: 'localhost',
          id: 'postgres-connection',
          engine: 'postgresql',
          name: 'Postgres',
          password: 'password',
          port: Number(import.meta.env.VITE_POSTGRESQL_PORT),
          schema: 'public',
          ssh: null,
          type: 'remote',
          user: 'postgres',
        },
      ]
    : [];
