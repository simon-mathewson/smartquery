import { createTables } from './createTables';
import { insertData } from './insertData';
import { resetDatabase } from './resetDatabase';
import type { Connection } from './types';

export const seed = async () => {
  console.info('Seeding databases...');

  const connections: Connection[] = [
    {
      database: 'mysql_db',
      defaultDatabase: 'mysql',
      engine: 'mysql',
      host: 'localhost',
      password: 'password',
      port: Number(process.env.VITE_MYSQL_PORT),
      user: 'root',
    },
    {
      database: 'postgres_db',
      defaultDatabase: 'postgres',
      engine: 'postgres',
      host: 'localhost',
      password: 'password',
      port: Number(process.env.VITE_POSTGRESQL_PORT),
      user: 'postgres',
    },
  ];

  for (const connection of connections) {
    await resetDatabase(connection);
    await createTables(connection);
    await insertData(connection);
  }
};
