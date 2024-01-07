import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { uniqueId } from 'lodash';
import { MySqlClient, PostgresClient, SqlServerClient } from '../../prisma';

const clients: { [connectionId: string]: MySqlClient | PostgresClient | SqlServerClient } = {};

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router({
  connectDb: t.procedure
    .input(
      z.object({
        database: z.string().trim().min(1),
        engine: z.union([z.literal('mysql'), z.literal('postgresql'), z.literal('sqlserver')]),
        host: z.string().trim().min(1),
        id: z.string(),
        name: z.string().trim().min(1),
        password: z.string(),
        port: z.number(),
        user: z.string().trim().min(1),
      }),
    )
    .mutation(async (props) => {
      const { database, engine, host, password, port, user } = props.input;

      const clientId = uniqueId();

      const client = {
        mysql: new MySqlClient({
          datasourceUrl: `mysql://${user}:${password}@${host}:${port}/${database}`,
        }),
        postgresql: new PostgresClient({
          datasourceUrl: `postgresql://${user}:${password}@${host}:${port}/${database}`,
        }),
        sqlserver: new SqlServerClient({
          datasourceUrl: `sqlserver://${host}:${port};database=${database};user=${user};password=${password};encrypt=DANGER_PLAINTEXT`,
        }),
      }[engine];

      // Connect right away so we get an error if connection is invalid
      await client.$connect();

      clients[clientId] = client;

      return clientId;
    }),
  disconnectDb: t.procedure.input(z.string()).mutation(async (props) => {
    const clientId = props.input;

    await clients[clientId]?.$disconnect();

    delete clients[clientId];
  }),
  sendQuery: t.procedure.input(z.tuple([z.string(), z.string()])).query(async (props) => {
    const [clientId, query] = props.input;

    const rows =
      await clients[clientId]!.$queryRawUnsafe<Array<Record<string, string | Date>>>(query);

    return rows;
  }),
});

export type AppRouter = typeof router;
