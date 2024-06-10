import { beforeEach, test, describe, expect, afterEach, afterAll } from 'vitest';
import { setUpServer } from '../../utils/setUpServer/setUpServer';
import { getTrpcClient } from '../../test/utils/getTrpcClient';
import { context } from '../../utils/setUpServer/createContext';
import { seed } from '../../test/utils/seed';

describe('router', () => {
  let server: ReturnType<typeof setUpServer> | null = null;
  let client: ReturnType<typeof getTrpcClient>;

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
    seed();

    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    server = setUpServer();
    client = getTrpcClient();
  });

  afterEach(async () => {
    if (!server) return;
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      const expectSuccessfulConnection = (
        response: Awaited<ReturnType<typeof client.connectDb.mutate>>,
      ) => {
        expect(response).toBeTypeOf('string');
        expect(response).toBeTruthy();

        expect(context.clients).toMatchObject({
          [mysqlConnection.id]: expect.any(Object),
        });
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
