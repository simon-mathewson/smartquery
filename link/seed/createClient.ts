import { MySqlClient, PostgresClient, SqlServerClient } from '../prisma';
import { Connection } from './types';

export const createClient = async (
  connection: Connection,
  options?: { useDefaultDatabase: true },
) => {
  const { engine, database, defaultDatabase, host, password, port, user } = connection;

  const Client = {
    mysql: MySqlClient,
    postgresql: PostgresClient,
    sqlserver: SqlServerClient,
  }[engine];

  const db = options?.useDefaultDatabase ? defaultDatabase : database;

  const url =
    engine === 'sqlserver'
      ? `sqlserver://${host}:${port};database=${db};user=${user};password=${password};encrypt=DANGER_PLAINTEXT`
      : `${engine}://${user}:${password}@${host}:${port}/${db}`;

  return new Client({ datasourceUrl: url });
};
