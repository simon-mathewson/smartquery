import type { PrismaClient, UsageType } from '~/prisma/generated';
import { plans } from '@/subscriptions/plans';
import { getUsage } from './getUsage';
import { TRPCError } from '@trpc/server';
import type { CurrentUser } from '~/context';

const getLimit = (type: UsageType, plan: keyof typeof plans) =>
  ({
    aiCredits: plans[plan].limits.aiCredits,
    queryDurationMilliseconds: plans[plan].limits.totalQueryDurationMilliseconds,
    queryResponseBytes: plans[plan].limits.totalQueryResponseBytes,
  }[type]);

export const verifyUsageWithinLimits = async (props: {
  prisma: PrismaClient;
  types: UsageType[];
  user: CurrentUser;
}) => {
  const { prisma, types, user } = props;

  const subscriptionAndUsage = await getUsage({ prisma, user });

  types.forEach((type) => {
    const totalUsage = subscriptionAndUsage.usage[type];
    const limit = getLimit(type, user.activeSubscription?.type ?? 'free');

    if (totalUsage > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Usage limit exceeded for ${type}`,
      });
    }
  });
};
