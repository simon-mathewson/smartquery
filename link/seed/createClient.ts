import { MySqlClient, PostgresClient } from '@/connector/prisma';
import type { Connection } from './types';

export const createClient = async (
  connection: Connection,
  options?: { useDefaultDatabase: true },
) => {
  const { engine, database, defaultDatabase, host, password, port, user } = connection;

  const Client = {
    mysql: MySqlClient,
    postgres: PostgresClient,
  }[engine];

  const db = options?.useDefaultDatabase ? defaultDatabase : database;

  return new Client({ datasourceUrl: `${engine}://${user}:${password}@${host}:${port}/${db}` });
};
