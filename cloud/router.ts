import { authRouter } from './auth/router';
import { connectionsRouter } from './connections/router';
import { trpc } from '~/trpc';
import { connectorRouter } from './connector/router';

export const appRouter = trpc.router({
  auth: authRouter,
  connections: connectionsRouter,
  connector: connectorRouter,
});

export type AppRouter = typeof appRouter;
