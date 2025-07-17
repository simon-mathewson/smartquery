import { initTRPC } from '@trpc/server';
import { uniqueId } from 'lodash-es';
import superjson from '@/superjson/superjson';
import { z } from 'zod';
import { MySqlClient, PostgresClient } from '../../../prisma';
import { createSshTunnel } from '../utils/createSshTunnel';
import type { Context } from '../utils/setUpServer/context';
import { remoteConnectionSchema } from '@/types/connection';
import type { PrismaValue } from '@/types/prisma';

const trpc = initTRPC.context<Context>().create({ transformer: superjson });

export const router = trpc.router({
  connectDb: trpc.procedure.input(remoteConnectionSchema).mutation(async (props) => {
    const {
      ctx: { clients },
      input: { database, engine, host: remoteHost, password, port: remotePort, schema, ssh, user },
    } = props;

    const clientId = uniqueId();

    const { sshLocalHost, sshLocalPort, sshTunnel } = ssh
      ? await createSshTunnel(props.input)
      : {
          sshLocalHost: undefined,
          sshLocalPort: undefined,
          sshTunnel: null,
        };

    const host = sshLocalHost ?? remoteHost;
    const port = sshLocalPort ?? remotePort;

    const client = (() => {
      const encodedPassword = password ? encodeURIComponent(password) : '';

      if (engine === 'mysql') {
        return new MySqlClient({
          datasourceUrl: `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`,
        });
      }
      if (engine === 'postgres') {
        return new PostgresClient({
          datasourceUrl: `postgres://${user}:${encodedPassword}@${host}:${port}/${database}${schema ? `?schema=${schema}` : ''}`,
        });
      }
      throw new Error(`Unsupported engine: ${engine}`);
    })();

    try {
      // Connect right away so we get an error if connection is invalid
      await client.$connect();
    } catch (error: unknown) {
      console.error(error);
      if (sshTunnel) {
        void sshTunnel.shutdown();
      }
      throw error;
    }

    clients[clientId] = {
      connection: props.input,
      prisma: client,
      sshTunnel,
    };

    return clientId;
  }),
  disconnectDb: trpc.procedure.input(z.string()).mutation(async (props) => {
    const {
      ctx: { clients },
      input: clientId,
    } = props;
    if (!(clientId in clients)) return;

    const client = clients[clientId];

    await client.prisma.$disconnect();
    await client.sshTunnel?.shutdown();

    delete clients[clientId];
  }),
  sendQuery: trpc.procedure
    .input(
      z.object({
        clientId: z.string(),
        statements: z.array(z.string()),
      }),
    )
    .mutation(async (props) => {
      const {
        ctx: { clients },
        input: { clientId, statements },
      } = props;

      if (import.meta.env.DEV) {
        console.info('Processing query', statements);
      }

      const client = clients[clientId];

      if (!client) {
        throw new Error('Client not found');
      }

      const { prisma } = client;

      const results = await (prisma as PostgresClient).$transaction(
        statements.map((statement) =>
          (prisma as PostgresClient).$queryRawUnsafe<Array<Record<string, PrismaValue>>>(statement),
        ),
      );

      if (import.meta.env.DEV) {
        console.info('Executed queries', results.length);
      }

      return results;
    }),
  status: trpc.procedure.query(() => true),
});

export type Router = typeof router;
