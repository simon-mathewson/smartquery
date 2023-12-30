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
      password: 'password',
      port: 3307,
      user: 'root',
    },
    {
      database: 'postgresql_db',
      defaultDatabase: 'postgres',
      engine: 'postgresql',
      password: 'password',
      port: 5433,
      user: 'postgres',
    },
  ];

  for (const connection of connections) {
    await resetDatabase(connection);
    await createTables(connection);
    await insertData(connection);
  }
})();
