import { createTables } from './createTables';
import { insertData } from './insertData';
import { resetDatabase } from './resetDatabase';
import { Connection } from './types';

(async () => {
  const connections: Connection[] = [
    {
      database: 'mysql_db',
      defaultDatabase: 'mysql',
      engine: 'mysql',
      host: 'localhost',
      password: 'password',
      port: 3307,
      user: 'root',
    },
    {
      database: 'postgresql_db',
      defaultDatabase: 'postgres',
      engine: 'postgresql',
      host: 'localhost',
      password: 'password',
      port: 5433,
      user: 'postgres',
    },
    {
      database: 'sqlserver_db',
      defaultDatabase: 'master',
      engine: 'sqlserver',
      host: 'localhost',
      password: 'Password1!',
      port: 1434,
      user: 'sa',
    },
  ];

  for (const connection of connections) {
    await resetDatabase(connection);
    await createTables(connection);
    await insertData(connection);
  }
})();
