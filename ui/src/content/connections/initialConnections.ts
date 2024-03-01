import * as uuid from 'uuid';

import type { Connection } from './types';

export const initialConnections = [
  {
    database: 'postgresql_db',
    engine: 'postgresql',
    host: 'localhost',
    id: uuid.v4(),
    name: 'PostgreSQL',
    password: 'password',
    port: 5433,
    user: 'postgres',
  },
  {
    database: 'mysql_db',
    engine: 'mysql',
    host: 'localhost',
    id: uuid.v4(),
    name: 'MySQL',
    password: 'password',
    port: 3307,
    user: 'root',
  },
  {
    database: 'sqlserver_db',
    engine: 'sqlserver',
    host: 'localhost',
    id: uuid.v4(),
    name: 'SQL Server',
    password: 'Password1!',
    port: 1434,
    user: 'sa',
  },
  {
    database: 'mathewson_metals_development',
    engine: 'postgresql',
    host: 'localhost',
    id: uuid.v4(),
    name: 'Mathewson Metals',
    password: 'password',
    port: 5432,
    user: 'postgres',
  },
  {
    database: 'cosuno_development',
    engine: 'mysql',
    host: 'localhost',
    id: uuid.v4(),
    name: 'Cosuno Development',
    password: 'root',
    port: 3306,
    user: 'root',
  },
] satisfies Connection[];
