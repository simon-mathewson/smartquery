import { z } from 'zod';
import { remoteConnectionSchema } from '@/types/connection';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';
import { runQuery } from '@/connector/runQuery';
import { trpc } from '~/trpc';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import type { Connector } from '@/connector/types';

const connectors: Record<string, Connector> = {};

export const connectorRouter = trpc.router({
  connectDb: trpc.procedure
    .input(remoteConnectionSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const { input: connection } = props;

      const connector = await connect(connection);

      if (process.env.NODE_ENV === 'development') {
        console.info('Connected to', connection.id);
      }

      connectors[connector.id] = connector;

      return connector.id;
    }),
  disconnectDb: trpc.procedure
    .input(z.string())
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const { input: connectorId } = props;
      if (!(connectorId in connectors)) return;

      await disconnect(connectors[connectorId]);

      if (process.env.NODE_ENV === 'development') {
        console.info('Disconnected from', connectorId);
      }

      delete connectors[connectorId];
    }),
  sendQuery: trpc.procedure
    .input(
      z.object({
        connectorId: z.string(),
        statements: z.array(z.string()),
      }),
    )
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        input: { connectorId, statements },
      } = props;

      if (process.env.NODE_ENV === 'development') {
        console.info(`Processing ${statements.length} queries`);
      }

      if (!(connectorId in connectors)) {
        throw new Error('Connector not found');
      }

      const results = await runQuery(connectors[connectorId], statements);

      if (process.env.NODE_ENV === 'development') {
        console.info('Executed queries', results.length);
      }

      return results;
    }),
});

export type Router = typeof connectorRouter;
