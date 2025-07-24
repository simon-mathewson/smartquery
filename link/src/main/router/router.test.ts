import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { MySqlClient, PostgresClient } from '@/connector/prisma';
import { trpcClient } from '../test/utils/getTrpcClient';
import { initialContext } from '../utils/setUpServer/context';
import { setUpServer } from '../utils/setUpServer/setUpServer';
import { cloneDeep } from 'lodash-es';
import { mocks } from '../test/mocks';
import { seed } from '../../../seed/seed';

describe('router', () => {
  let context = initialContext;

  beforeAll(() => {
    setUpServer({ createContext: () => context });
  });

  beforeEach(() => {
    context = cloneDeep(initialContext);
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(context.connectors).map((client) => {
        void client.prisma.$disconnect();
        void client.sshTunnel?.shutdown();
      }),
    );
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      test.each([
        { connection: mocks.connections.mysql, PrismaClient: MySqlClient },
        { connection: mocks.connections.postgres, PrismaClient: PostgresClient },
      ] as const)('$connection.engine', async ({ PrismaClient, connection }) => {
        const response = await trpcClient.connectDb.mutate(connection);

        expect(response).toBeTypeOf('string');
        expect(response).toBeTruthy();

        const clients = Object.entries(context.connectors);

        expect(Object.keys(context.connectors)).toHaveLength(1);

        const [clientId, client] = clients[0];

        expect(clientId).toBe(response);
        expect(clientId).toBeTypeOf('string');
        expect(clientId).toBeTruthy();

        expect(client.connection).toMatchObject(connection);
        expect(client.prisma).toBeInstanceOf(PrismaClient);
        expect(client.sshTunnel).toBeNull();
      });
    });
  });

  describe('disconnectDb', () => {
    describe('disconnects from the database', async () => {
      const spyOnDisconnect = (clientId: string) => {
        const client = context.connectors[clientId];
        return vi.spyOn(client.prisma, '$disconnect');
      };

      test.each([mocks.connections.mysql, mocks.connections.postgres])(
        '$engine',
        async (connection) => {
          const clientId = await trpcClient.connectDb.mutate(connection);

          const disconnectSpy = spyOnDisconnect(clientId);

          await trpcClient.disconnectDb.mutate(clientId);

          expect(disconnectSpy).toHaveBeenCalledTimes(1);
          expect(Object.keys(context.connectors)).toHaveLength(0);
        },
      );
    });

    describe('sendQuery', () => {
      beforeEach(async () => {
        await seed();
      });

      describe('allows selecting, updating, deleting, and inserting rows', async () => {
        test.each([mocks.connections.mysql, mocks.connections.postgres])(
          '$engine',
          async (connection) => {
            const mysqlClientId = await trpcClient.connectDb.mutate(connection);

            const response = await trpcClient.sendQuery.mutate({
              clientId: mysqlClientId,
              statements: [
                'SELECT * FROM simple',
                'UPDATE simple SET id = 10 WHERE id = 3',
                'DELETE FROM simple',
                'INSERT INTO simple (id) VALUES (4)',
              ],
            });

            expect(response).toHaveLength(4);
            expect(response[0]).toHaveLength(3);
            expect(response[1]).toHaveLength(0);
            expect(response[2]).toHaveLength(0);
            expect(response[3]).toHaveLength(0);
          },
        );
      });

      describe('executes statements in transaction', async () => {
        test.each([mocks.connections.mysql, mocks.connections.postgres])(
          '$engine',
          async (connection) => {
            const mysqlClientId = await trpcClient.connectDb.mutate(connection);

            const invalidQuery = trpcClient.sendQuery.mutate({
              clientId: mysqlClientId,
              statements: ['UPDATE simple SET id = 10 WHERE id = 3', 'Invalid Query'],
            });

            await expect(invalidQuery).rejects.toThrowError();

            const response = await trpcClient.sendQuery.mutate({
              clientId: mysqlClientId,
              statements: ['SELECT * FROM simple WHERE id = 10'],
            });

            expect(response).toHaveLength(1);
            expect(response[0]).toHaveLength(0);
          },
        );
      });
    });
  });

  describe('status', () => {
    test('returns true', async () => {
      const response = await trpcClient.status.query();

      expect(response).toBe(true);
    });
  });
});
