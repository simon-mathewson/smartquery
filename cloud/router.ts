import { authRouter } from './auth/router';
import { connectionsRouter } from './connections/router';
import { trpc } from '~/trpc';
import { usageRouter } from './usage/router';
import { subscriptionsRouter } from './subscriptions/router';
import { savedQueriesRouter } from './savedQueries/router';

export const appRouter = trpc.router({
  auth: authRouter,
  connections: connectionsRouter,
  savedQueries: savedQueriesRouter,
  subscriptions: subscriptionsRouter,
  usage: usageRouter,
});

export type CloudRouter = typeof appRouter;
