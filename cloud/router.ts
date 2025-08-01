import { authRouter } from './auth/router';
import { connectionsRouter } from './connections/router';
import { trpc } from '~/trpc';
import { connectorRouter } from './connector/router';
import { aiRouter } from './ai/router';
import { subscriptionRouter } from './subscription/router';

export const appRouter = trpc.router({
  ai: aiRouter,
  auth: authRouter,
  connections: connectionsRouter,
  connector: connectorRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
