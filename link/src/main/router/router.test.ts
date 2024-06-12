import { beforeAll, describe, expect, test } from 'vitest';
import { MySqlClient, PostgresClient } from '../../../prisma';
import { trpcClient } from '../test/utils/getTrpcClient';
import type { Context } from '../utils/setUpServer/context';
import { initialContext } from '../utils/setUpServer/context';
import { setUpServer } from '../utils/setUpServer/setUpServer';
import { cloneDeep } from 'lodash';

describe('router', () => {
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

  let context: Context;

  beforeAll(() => {
    setUpServer({
      createContext: () => {
        const newContext = cloneDeep(initialContext);
        context = newContext;
        return newContext;
      },
    });
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      const expectSuccessfulConnection = async (
        response: Awaited<ReturnType<typeof trpcClient.connectDb.mutate>>,
        connection: typeof mysqlConnection | typeof postgresConnection,
        PrismaClient: typeof MySqlClient | typeof PostgresClient,
      ) => {
        expect(response).toBeTypeOf('string');
        expect(response).toBeTruthy();

        const clients = Object.entries(context.clients);

        expect(Object.keys(context.clients)).toHaveLength(1);

        const [clientId, client] = clients[0];

        expect(clientId).toBe(response);
        expect(clientId).toBeTypeOf('string');
        expect(clientId).toBeTruthy();

        expect(client.connection).toMatchObject(connection);
        expect(client.prisma).toBeInstanceOf(PrismaClient);
        expect(client.sshTunnel).toBeNull();
      };

      test('mysql', async () => {
        const mysqlResponse = await trpcClient.connectDb.mutate(mysqlConnection);
        await expectSuccessfulConnection(mysqlResponse, mysqlConnection, MySqlClient);
      });

      test('postgres', async () => {
        const postgresResponse = await trpcClient.connectDb.mutate(postgresConnection);
        await expectSuccessfulConnection(postgresResponse, postgresConnection, PostgresClient);
      });
    });
  });
});
