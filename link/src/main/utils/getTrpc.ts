import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { createContext } from './setUpServer/createContext';

export const getTrpc = () =>
  initTRPC.context<ReturnType<typeof createContext>>().create({ transformer: superjson });
