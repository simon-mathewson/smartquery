import { z } from 'zod';
import { remoteConnectionSchema } from '@/connections/types';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';
import type { Results } from '@/connector/runQuery';
import { runQuery } from '@/connector/runQuery';
import { trpc } from '~/trpc';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import type { Connector } from '@/connector/types';
import type { CurrentUser } from '~/context';
import { PLUS_MAX_CONCURRENT_CONNECTIONS, PLUS_MAX_CONCURRENT_QUERY_STATEMENTS } from '@/plus/plus';
import { TRPCError } from '@trpc/server';
import { trackQueryResponseBytes } from './trackQueryResponseBytes';
import { verifyUsageWithinLimits } from '~/subscription/verifyUsageWithinLimits';

const connectors: Record<
  string,
  {
    connector: Connector;
    queue: Array<() => Promise<void>>;
    user: CurrentUser;
  }
> = {};

export const connectorRouter = trpc.router({
  connectDb: trpc.procedure
    .input(remoteConnectionSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const { input: connection } = props;

      const existingConnectionsCount = Object.values(connectors).filter(
        (connector) => connector.user.id === props.ctx.user.id,
      ).length;

      if (existingConnectionsCount >= PLUS_MAX_CONCURRENT_CONNECTIONS) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'You have reached the maximum number of concurrent connections',
        });
      }

      const connector = await connect(connection);

      if (process.env.NODE_ENV === 'development') {
        console.info('Connected to', connection.id);
      }

      connectors[connector.id] = {
        connector,
        queue: [],
        user: props.ctx.user,
      };

      return connector.id;
    }),
  disconnectDb: trpc.procedure
    .input(z.string())
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const { input: connectorId } = props;
      if (!(connectorId in connectors)) return;

      await disconnect(connectors[connectorId].connector);

      if (process.env.NODE_ENV === 'development') {
        console.info('Disconnected from', connectorId);
      }

      delete connectors[connectorId];
    }),
  sendQuery: trpc.procedure
    .input(
      z.object({
        connectorId: z.string(),
        statements: z.array(z.string()).max(PLUS_MAX_CONCURRENT_QUERY_STATEMENTS),
      }),
    )
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { prisma, user },
        input: { connectorId, statements },
      } = props;

      if (process.env.NODE_ENV === 'development') {
        console.info(`Processing ${statements.length} queries`);
      }

      if (!(connectorId in connectors)) {
        throw new Error('Connector not found');
      }

      await verifyUsageWithinLimits({
        prisma,
        types: ['queryDurationMilliseconds', 'queryResponseBytes'],
        user,
      });

      const connector = connectors[connectorId];

      const results = await new Promise<Results>((resolve) => {
        connector.queue.push(async () => {
          const queryStart = Date.now();

          try {
            const results = await runQuery(connector.connector, statements);
            resolve(results);
          } finally {
            const queryDuration = Date.now() - queryStart;

            if (process.env.NODE_ENV === 'development') {
              console.info(`Query duration: ${queryDuration}ms`);
            }

            connector.queue.shift();

            if (connector.queue.length > 0) {
              void connector.queue[0]();
            }

            await prisma.usage.create({
              data: {
                amount: queryDuration,
                type: 'queryDurationMilliseconds',
                userId: user.id,
              },
            });
          }
        });

        if (connector.queue.length === 1) {
          void connector.queue[0]();
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.info('Executed queries', results.length);
      }

      void trackQueryResponseBytes({ prisma, user, results });

      return results;
    }),
});
