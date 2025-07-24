import { initTRPC } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';

export const trpc = initTRPC.context<Context>().create({ transformer: superjson });
