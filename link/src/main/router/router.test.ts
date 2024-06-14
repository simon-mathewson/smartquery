import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { MySqlClient, PostgresClient } from '../../../prisma';
import { trpcClient } from '../test/utils/getTrpcClient';
import type { Context } from '../utils/setUpServer/context';
import { initialContext } from '../utils/setUpServer/context';
import { setUpServer } from '../utils/setUpServer/setUpServer';
import { cloneDeep } from 'lodash';
import { mocks } from '../test/mocks';
import type { Connection } from '../types';

describe('router', () => {
  let context: Context;

  beforeAll(() => {
    setUpServer({ createContext: () => context });
  });

  beforeEach(() => {
    context = cloneDeep(initialContext);
  });

  describe('connectDb', () => {
    describe('connects to the database', async () => {
      const expectSuccessfulConnection = async (
        response: Awaited<ReturnType<typeof trpcClient.connectDb.mutate>>,
        connection: Connection,
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
        const mysqlResponse = await trpcClient.connectDb.mutate(mocks.connection.mysql);
        await expectSuccessfulConnection(mysqlResponse, mocks.connection.mysql, MySqlClient);
      });

      test('postgres', async () => {
        const postgresResponse = await trpcClient.connectDb.mutate(mocks.connection.postgres);
        await expectSuccessfulConnection(
          postgresResponse,
          mocks.connection.postgres,
          PostgresClient,
        );
      });
    });
  });

  describe('disconnectDb', () => {
    describe('disconnects from the database', async () => {
      const spyOnDisconnect = (clientId: string) => {
        const client = context.clients[clientId];
        return vi.spyOn(client.prisma, '$disconnect');
      };

      const expectSuccessfulDisconnect = async (spy: ReturnType<typeof spyOnDisconnect>) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(Object.keys(context.clients)).toHaveLength(0);
      };

      test('mysql', async () => {
        const mysqlClientId = await trpcClient.connectDb.mutate(mocks.connection.mysql);

        const disconnectSpy = spyOnDisconnect(mysqlClientId);

        await trpcClient.disconnectDb.mutate(mysqlClientId);

        await expectSuccessfulDisconnect(disconnectSpy);
      });

      test('postgres', async () => {
        const postgresClientId = await trpcClient.connectDb.mutate(mocks.connection.postgres);

        const disconnectSpy = spyOnDisconnect(postgresClientId);

        await trpcClient.disconnectDb.mutate(postgresClientId);

        await expectSuccessfulDisconnect(disconnectSpy);
      });
    });
  });
});
