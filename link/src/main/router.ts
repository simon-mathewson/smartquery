import { initTRPC } from '@trpc/server';
import { uniqueId } from 'lodash';
import superjson from 'superjson';
import { z } from 'zod';
import { MySqlClient, PostgresClient } from '../../prisma';
import type { PrismaValue } from './types';
import { connectionSchema, type Client } from './types';

const clients: {
  [connectionId: string]: Client;
} = {};

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router({
  connectDb: t.procedure.input(connectionSchema).mutation(async (props) => {
    const { database, engine, host, password, port, user } = props.input;

    const clientId = uniqueId();

    const client = {
      mysql: new MySqlClient({
        datasourceUrl: `mysql://${user}:${password}@${host}:${port}/${database}`,
      }),
      postgresql: new PostgresClient({
        datasourceUrl: `postgresql://${user}:${password}@${host}:${port}/${database}`,
      }),
    }[engine];

    // Connect right away so we get an error if connection is invalid
    await client.$connect();

    clients[clientId] = {
      connection: props.input,
      prisma: client,
    };

    return clientId;
  }),
  disconnectDb: t.procedure.input(z.string()).mutation(async (props) => {
    const clientId = props.input;
    if (!clients[clientId]) return;

    await clients[clientId]!.prisma.$disconnect();

    delete clients[clientId];
  }),
  sendQuery: t.procedure
    .input(
      z.object({
        clientId: z.string(),
        statements: z.array(z.string()),
      }),
    )
    .mutation(async (props) => {
      const { clientId, statements } = props.input;

      console.info('Processing query', statements);

      const client = clients[clientId];
      const { prisma } = client;

      const results = await (prisma as PostgresClient).$transaction(
        statements.map((statement) =>
          (prisma as PostgresClient).$queryRawUnsafe<Array<Record<string, PrismaValue>>>(statement),
        ),
      );

      console.info('Executed queries', results);

      return results;
    }),
});

export type AppRouter = typeof router;
