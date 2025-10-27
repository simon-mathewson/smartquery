import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { trpcClient } from '../test/utils/getTrpcClient';
import { initialContext } from '../utils/setUpServer/context';
import { setUpServer } from '../utils/setUpServer/setUpServer';
import { cloneDeep } from 'lodash-es';
import { mocks } from '../test/mocks';
import { seed } from '../../../seed/seed';
import { disconnect } from '@/connector/disconnect';
import assert from 'node:assert';

describe('router', () => {
  let context = initialContext;

  beforeAll(() => {
    setUpServer({ createContext: () => context });
  });

  beforeEach(() => {
    context = cloneDeep(initialContext);
  });

  afterEach(async () => {
    vi.resetAllMocks();

    await Promise.all(Object.values(context.connectors).map((client) => disconnect(client)));
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      test.each([mocks.connections.mysql, mocks.connections.postgres] as const)(
        '$connection.engine',
        async (connection) => {
          const response = await trpcClient.connectDb.mutate(connection);

          expect(response).toBeTypeOf('string');
          expect(response).toBeTruthy();

          const clients = Object.entries(context.connectors);

          expect(Object.keys(context.connectors)).toHaveLength(1);

          const [connectorId, client] = clients[0];

          expect(connectorId).toBe(response);
          expect(connectorId).toBeTypeOf('string');
          expect(connectorId).toBeTruthy();

          expect(client.connection).toMatchObject(connection);
          if ('mysqlPool' in client) {
            expect(client.mysqlPool).toBeTypeOf('object');
          } else if ('postgresPool' in client) {
            expect(client.postgresPool).toBeTypeOf('object');
          } else {
            throw new Error('Unsupported connector type');
          }
          expect(client.sshTunnel).toBeNull();
        },
      );
    });
  });

  describe('disconnectDb', () => {
    describe('disconnects from the database', async () => {
      const spyOnDisconnect = (connectorId: string) => {
        const client = context.connectors[connectorId];
        if ('mysqlPool' in client) {
          return vi.spyOn(client.mysqlPool, 'end').mockResolvedValue(undefined);
        } else if ('postgresPool' in client) {
          return vi.spyOn(client.postgresPool, 'end').mockResolvedValue(undefined);
        } else {
          throw new Error('Unsupported connector type');
        }
      };

      test.each([mocks.connections.mysql, mocks.connections.postgres])(
        '$engine',
        async (connection) => {
          const connectorId = await trpcClient.connectDb.mutate(connection);

          const disconnectSpy = spyOnDisconnect(connectorId);

          await trpcClient.disconnectDb.mutate(connectorId);

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
            const mysqlConnectorId = await trpcClient.connectDb.mutate(connection);

            const response = await trpcClient.sendQuery.mutate({
              connectorId: mysqlConnectorId,
              statements: [
                'SELECT * FROM simple',
                'UPDATE simple SET id = 10 WHERE id = 3',
                'DELETE FROM simple',
                'INSERT INTO simple (id) VALUES (4)',
              ],
            });

            assert(
              response.every((r) => 'rows' in r),
              'Response is an array of objects with a rows property',
            );

            expect(response).toHaveLength(4);
            expect(response[0].rows).toHaveLength(3);
            expect(response[1].rows).toHaveLength(0);
            expect(response[2].rows).toHaveLength(0);
            expect(response[3].rows).toHaveLength(0);
          },
        );
      });

      describe('executes statements in transaction', async () => {
        test.each([mocks.connections.mysql, mocks.connections.postgres])(
          '$engine',
          async (connection) => {
            const mysqlConnectorId = await trpcClient.connectDb.mutate(connection);

            const invalidQuery = trpcClient.sendQuery.mutate({
              connectorId: mysqlConnectorId,
              statements: ['UPDATE simple SET id = 10 WHERE id = 3', 'Invalid Query'],
            });

            await expect(invalidQuery).rejects.toThrowError();

            const response = await trpcClient.sendQuery.mutate({
              connectorId: mysqlConnectorId,
              statements: ['SELECT * FROM simple WHERE id = 10'],
            });

            assert(
              response.every((r) => 'rows' in r),
              'Response is an array of objects with a rows property',
            );

            expect(response).toHaveLength(1);
            expect(response[0].rows).toHaveLength(0);
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
