import { MySqlClient, PostgresClient } from '../prisma';
import { Connection } from './types';

export const createClient = async (
  connection: Connection,
  options?: { useDefaultDatabase: true },
) => {
  const { engine, database, defaultDatabase, password, port, user } = connection;

  const Client = {
    mysql: MySqlClient,
    postgresql: PostgresClient,
  }[engine];

  return new Client({
    datasourceUrl: `${engine}://${user}:${password}@localhost:${port}/${
      options?.useDefaultDatabase ? defaultDatabase : database
    }`,
  });
};
