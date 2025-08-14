import { authRouter } from './auth/router';
import { connectionsRouter } from './connections/router';
import { trpc } from '~/trpc';
import { connectorRouter } from './connector/router';
import { aiRouter } from './ai/router';
import { usageRouter } from './usage/router';
import { paymentsRouter } from './payments/router';

export const appRouter = trpc.router({
  ai: aiRouter,
  auth: authRouter,
  connections: connectionsRouter,
  connector: connectorRouter,
  payments: paymentsRouter,
  usage: usageRouter,
});

export type CloudRouter = typeof appRouter;
