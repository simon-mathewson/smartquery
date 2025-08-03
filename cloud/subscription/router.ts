import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';
import { subscriptionSchema } from './types';
import { getSubscriptionAndUsage } from './getSubscriptionAndUsage';

export const subscriptionRouter = trpc.router({
  subscription: trpc.procedure
    .use(isAuthenticatedAndPlus)
    .output(subscriptionSchema)
    .query(async (props) => {
      const {
        ctx: { prisma, user },
      } = props;

      return getSubscriptionAndUsage({ prisma, user });
    }),
});
