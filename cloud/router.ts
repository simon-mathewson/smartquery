import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from './context';
import { authRouter } from './auth/router';

const trpc = initTRPC.context<Context>().create({ transformer: superjson });

export const appRouter = trpc.router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
