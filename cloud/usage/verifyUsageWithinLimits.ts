import type { PrismaClient, UsageType } from '~/prisma/generated';
import { plans } from '@/subscriptions/plans';
import { getUsage } from './getUsage';
import { TRPCError } from '@trpc/server';
import type { CurrentUser } from '~/context';

const usageTypeToLimit: Record<UsageType, number> = {
  aiCredits: plans.plus.limits.aiCredits,
  queryDurationMilliseconds: plans.plus.limits.totalQueryDurationMilliseconds,
  queryResponseBytes: plans.plus.limits.totalQueryResponseBytes,
};

export const verifyUsageWithinLimits = async (props: {
  prisma: PrismaClient;
  types: UsageType[];
  user: CurrentUser;
}) => {
  const { prisma, types, user } = props;

  const subscriptionAndUsage = await getUsage({ prisma, user });

  types.forEach((type) => {
    const totalUsage = subscriptionAndUsage.usage[type];
    const limit = usageTypeToLimit[type];

    if (totalUsage > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Usage limit exceeded for ${type}`,
      });
    }
  });
};
