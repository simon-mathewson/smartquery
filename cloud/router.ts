import { authRouter } from './auth/router';
import { connectionsRouter } from './connections/router';
import { trpc } from '~/trpc';
import { aiRouter } from './ai/router';
import { usageRouter } from './usage/router';
import { subscriptionsRouter } from './subscriptions/router';
import { savedQueriesRouter } from './savedQueries/router';

export const appRouter = trpc.router({
  ai: aiRouter,
  auth: authRouter,
  connections: connectionsRouter,
  savedQueries: savedQueriesRouter,
  subscriptions: subscriptionsRouter,
  usage: usageRouter,
});

export type CloudRouter = typeof appRouter;
