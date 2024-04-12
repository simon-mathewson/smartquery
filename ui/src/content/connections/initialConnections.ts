import type { Connection } from '~/shared/types';

export const initialConnections = [
  {
    database: 'postgresql_db',
    engine: 'postgresql',
    host: 'localhost',
    id: '0',
    name: 'PostgreSQL',
    password: 'password',
    port: 5433,
    user: 'postgres',
  },
  {
    database: 'mysql_db',
    engine: 'mysql',
    host: 'localhost',
    id: '1',
    name: 'MySQL',
    password: 'password',
    port: 3307,
    user: 'root',
  },
  {
    database: 'mathewson_metals_development',
    engine: 'postgresql',
    host: 'localhost',
    id: '2',
    name: 'Mathewson Metals',
    password: 'password',
    port: 5432,
    user: 'postgres',
  },
  {
    database: 'cosuno_development',
    engine: 'mysql',
    host: 'localhost',
    id: '3',
    name: 'Cosuno Development',
    password: 'root',
    port: 3306,
    user: 'root',
  },
] satisfies Connection[];
