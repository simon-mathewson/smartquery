import { Client } from 'pg';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { uniqueId } from 'lodash';

const clients: { [connectionId: string]: Client } = {};

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router({
  connectDb: t.procedure
    .input(
      z.object({
        database: z.string().trim().min(1),
        engine: z.union([z.literal('postgres'), z.literal('mysql')]),
        host: z.string().trim().min(1),
        name: z.string().trim().min(1),
        password: z.string(),
        port: z.number(),
        user: z.string().trim().min(1),
      }),
    )
    .mutation(async (props) => {
      const { database, host, password, port, user } = props.input;

      const clientId = uniqueId();

      const client = new Client({
        database,
        host,
        password,
        port,
        user,
      });

      clients[clientId] = client;

      await client.connect();

      return clientId;
    }),
  disconnectDb: t.procedure.input(z.string()).mutation(async (props) => {
    const clientId = props.input;

    await clients[clientId]?.end();

    delete clients[clientId];
  }),
  sendQuery: t.procedure.input(z.tuple([z.string(), z.string()])).query(async (props) => {
    const [clientId, query] = props.input;

    const { fields, rows } = await clients[clientId]!.query(query);

    return { fields, rows };
  }),
});

export type AppRouter = typeof router;
