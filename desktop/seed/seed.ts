import type { RemoteConnection } from '@/connections/types';
import { createTables } from './createTables';
import { insertData } from './insertData';
import { resetDatabase } from './resetDatabase';

export const seed = async () => {
  console.info('Seeding databases...');

  const connections: Array<{ connection: RemoteConnection; defaultDatabase: string }> = [
    {
      defaultDatabase: 'mysql',
      connection: {
        credentialStorage: 'plain',
        database: 'mysql_db',
        engine: 'mysql',
        host: 'localhost',
        id: 'mysql-connection',
        name: 'MySQL',
        password: 'password',
        port: Number(process.env.VITE_MYSQL_PORT),
        ssh: null,
        storageLocation: 'local',
        type: 'remote',
        user: 'root',
      },
    },
    {
      defaultDatabase: 'postgres',
      connection: {
        credentialStorage: 'plain',
        database: 'postgres_db',
        engine: 'postgres',
        host: 'localhost',
        id: 'postgres-connection',
        name: 'Postgres',
        password: 'password',
        port: Number(process.env.VITE_POSTGRES_PORT),
        ssh: null,
        storageLocation: 'local',
        type: 'remote',
        user: 'postgres',
      },
    },
  ];

  for (const { connection, defaultDatabase } of connections) {
    await resetDatabase(connection, defaultDatabase);
    await createTables(connection);
    await insertData(connection);
  }
};
