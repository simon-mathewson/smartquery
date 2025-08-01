import { initTRPC } from '@trpc/server';
import superjson from '@/superjson/superjson';
import { z } from 'zod';
import type { Context } from '../utils/setUpServer/context';
import { remoteConnectionSchema } from '@/connections/types';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';
import { runQuery } from '@/connector/runQuery';

const trpc = initTRPC.context<Context>().create({ transformer: superjson });

export const router = trpc.router({
  connectDb: trpc.procedure.input(remoteConnectionSchema).mutation(async (props) => {
    const {
      ctx: { connectors },
      input: connection,
    } = props;

    const connector = await connect(connection);

    if (import.meta.env.DEV) {
      console.info('Connected to', connection.id);
    }

    connectors[connector.id] = connector;

    return connector.id;
  }),
  disconnectDb: trpc.procedure.input(z.string()).mutation(async (props) => {
    const {
      ctx: { connectors },
      input: connectorId,
    } = props;
    if (!(connectorId in connectors)) return;

    await disconnect(connectors[connectorId]);

    if (import.meta.env.DEV) {
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
    .mutation(async (props) => {
      const {
        ctx: { connectors },
        input: { statements },
      } = props;

      const connectorId = props.input.clientId ?? props.input.connectorId;

      if (!connectorId) {
        throw new Error('Connector ID is required');
      }

      if (import.meta.env.DEV) {
        console.info(`Processing ${statements.length} queries`);
      }

      if (!(connectorId in connectors)) {
        throw new Error('Connector not found');
      }

      const results = await runQuery(connectors[connectorId], statements);

      if (import.meta.env.DEV) {
        console.info('Executed queries', results.length);
      }

      return results;
    }),
  status: trpc.procedure.query(() => true),
});

export type Router = typeof router;
