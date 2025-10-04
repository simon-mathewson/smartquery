import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';
import { usageSchema } from './types';
import { getUsage } from './getUsage';
import { prisma } from '~/prisma/client';

export const usageRouter = trpc.router({
  usage: trpc.procedure
    .use(isAuthenticated)
    .output(usageSchema)
    .query(async (props) => {
      const {
        ctx: { user },
      } = props;

      return getUsage({ ip: undefined, prisma, user });
    }),
});
