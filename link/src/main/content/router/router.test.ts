import { beforeEach, test, describe, expect } from 'vitest';
import { trpcClient } from '../../test/utils/getTrpcClient';

describe('router', () => {
  let client: typeof trpcClient;

  const mysqlConnection = {
    database: 'mysql_db',
    engine: 'mysql',
    id: 'mysql-connection',
    host: 'localhost',
    name: 'Test Connection',
    password: 'password',
    port: 3308,
    ssh: null,
    user: 'root',
  } as const;

  const postgresConnection = {
    database: 'postgresql_db',
    host: 'localhost',
    id: 'postgres-connection',
    engine: 'postgresql',
    name: 'Test Connection',
    password: 'password',
    port: 5434,
    ssh: null,
    user: 'postgres',
  } as const;

  beforeEach(async () => {
    client = trpcClient;
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      const expectSuccessfulConnection = (
        response: Awaited<ReturnType<typeof client.connectDb.mutate>>,
      ) => {
        expect(response).toBeTypeOf('string');
        expect(response).toBeTruthy();
      };

      test('mysql', async () => {
        const mysqlResponse = await client.connectDb.mutate(mysqlConnection);
        expectSuccessfulConnection(mysqlResponse);
      });

      test('postgres', async () => {
        const postgresResponse = await client.connectDb.mutate(postgresConnection);
        expectSuccessfulConnection(postgresResponse);
      });
    });
  });
});
