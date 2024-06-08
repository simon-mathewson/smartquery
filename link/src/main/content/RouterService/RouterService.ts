import { initTRPC } from '@trpc/server';
import { uniqueId } from 'lodash';
import superjson from 'superjson';
import { z } from 'zod';
import { MySqlClient, PostgresClient } from '../../../../prisma';
import type { PrismaValue } from '../../types';
import { connectionSchema, type Clients } from '../../types';
import { createSshTunnel } from '../../utils/createSshTunnel';
import { Container, Service, Token } from 'typedi';

export const clientsToken = new Token<Clients>('clientsToken');

Container.set(clientsToken, {});

const t = initTRPC.create({ transformer: superjson });

@Service()
export class RouterService {
  constructor(private clients: Clients) {}

  router = t.router({
    connectDb: t.procedure.input(connectionSchema).mutation(async (props) => {
      const {
        database,
        engine,
        host: remoteHost,
        password,
        port: remotePort,
        ssh,
        user,
      } = props.input;

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

      const client = {
        mysql: new MySqlClient({
          datasourceUrl: `mysql://${user}:${password}@${host}:${port}/${database}`,
        }),
        postgresql: new PostgresClient({
          datasourceUrl: `postgresql://${user}:${password}@${host}:${port}/${database}`,
        }),
      }[engine];

      try {
        // Connect right away so we get an error if connection is invalid
        await client.$connect();
      } catch (error: unknown) {
        if (sshTunnel) {
          void sshTunnel.shutdown();
        }
        throw error;
      }

      this.clients[clientId] = {
        connection: props.input,
        prisma: client,
        sshTunnel,
      };

      return clientId;
    }),
    disconnectDb: t.procedure.input(z.string()).mutation(async (props) => {
      const clientId = props.input;
      if (!(clientId in this.clients)) return;

      const client = this.clients[clientId];

      await client.prisma.$disconnect();
      await client.sshTunnel?.shutdown();

      delete this.clients[clientId];
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

        const client = this.clients[clientId];
        const { prisma } = client;

        const results = await (prisma as PostgresClient).$transaction(
          statements.map((statement) =>
            (prisma as PostgresClient).$queryRawUnsafe<Array<Record<string, PrismaValue>>>(
              statement,
            ),
          ),
        );

        console.info('Executed queries', results);

        return results;
      }),
    status: t.procedure.query(() => true),
  });
}

export type AppRouter = RouterService['router'];
