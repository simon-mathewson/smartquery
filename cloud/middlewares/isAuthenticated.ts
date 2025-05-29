import { TRPCError } from '@trpc/server';
import { trpc } from '~/trpc';

export const isAuthenticated = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});
