import { z } from 'zod';
import { remoteConnectionSchema } from '@/types/connection';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';
import { runQuery } from '@/connector/runQuery';
import { trpc } from '~/trpc';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';

export const connectorRouter = trpc.router({
  connectDb: trpc.procedure
    .input(remoteConnectionSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { connectors },
        input: connection,
      } = props;

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
      const {
        ctx: { connectors },
        input: connectorId,
      } = props;
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
        /** @deprecated Use connectorId instead */
        clientId: z.string().optional(),
        connectorId: z.string().optional(),
        statements: z.array(z.string()),
      }),
    )
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { connectors },
        input: { statements },
      } = props;

      const connectorId = props.input.clientId ?? props.input.connectorId;

      if (!connectorId) {
        throw new Error('Connector ID is required');
      }

      if (process.env.NODE_ENV === 'development') {
        console.info('Processing query', statements);
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
