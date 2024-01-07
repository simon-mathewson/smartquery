import { uniqueId } from 'lodash';

import { Connection } from './types';

export const initialConnections = [
  {
    database: 'postgresql_db',
    engine: 'postgresql',
    host: 'localhost',
    id: uniqueId(),
    name: 'PostgreSQL',
    password: 'password',
    port: 5433,
    user: 'postgres',
  },
  {
    database: 'mysql_db',
    engine: 'mysql',
    host: 'localhost',
    id: uniqueId(),
    name: 'MySQL',
    password: 'password',
    port: 3307,
    user: 'root',
  },
  {
    database: 'sqlserver_db',
    engine: 'sqlserver',
    host: 'localhost',
    id: uniqueId(),
    name: 'SQL Server',
    password: 'Password1!',
    port: 1434,
    user: 'sa',
  },
  {
    database: 'mathewson_metals_development',
    engine: 'postgresql',
    host: 'localhost',
    id: uniqueId(),
    name: 'Mathewson Metals',
    password: 'password',
    port: 5432,
    user: 'postgres',
  },
] satisfies Connection[];
