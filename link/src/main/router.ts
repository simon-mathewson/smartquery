import { Client } from 'pg';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const clientRef: { current: Client | null } = {
  current: null,
};

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

      await clientRef.current?.end();

      clientRef.current = new Client({
        database,
        host,
        password,
        port,
        user,
      });

      await clientRef.current.connect();
    }),
  sendQuery: t.procedure.input(z.string()).query(async (props) => {
    const { fields, rows } = await clientRef.current!.query(props.input);
    return { fields, rows };
  }),
});

export type AppRouter = typeof router;
