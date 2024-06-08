import { createTables } from './createTables';
import { insertData } from './insertData';
import { resetDatabase } from './resetDatabase';
import type { Connection } from './types';

(async () => {
  const connections: Connection[] = [
    {
      database: 'mysql_db',
      defaultDatabase: 'mysql',
      engine: 'mysql',
      host: 'localhost',
      password: 'password',
      port: parseInt(process.env.MYSQL_PORT, 10),
      user: 'root',
    },
    {
      database: 'postgresql_db',
      defaultDatabase: 'postgres',
      engine: 'postgresql',
      host: 'localhost',
      password: 'password',
      port: parseInt(process.env.POSTGRESQL_PORT, 10),
      user: 'postgres',
    },
  ];

  for (const connection of connections) {
    await resetDatabase(connection);
    await createTables(connection);
    await insertData(connection);
  }
})();
