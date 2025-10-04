import type { PrismaClient, UsageType } from '~/prisma/generated';
import { getUsage } from './getUsage';
import { TRPCError } from '@trpc/server';
import type { CurrentUser } from '~/context';
import { getLimitsForUser } from '@/subscriptions/getLimitsForUser';

const getLimitForType = (type: UsageType, user: CurrentUser | null) => {
  const limits = getLimitsForUser(user);
  return {
    aiCredits: limits.aiCredits,
    queryDurationMilliseconds: limits.totalQueryDurationMilliseconds,
    queryResponseBytes: limits.totalQueryResponseBytes,
  }[type];
};

export const verifyUsageWithinLimits = async (props: {
  ip: string | undefined;
  prisma: PrismaClient;
  types: UsageType[];
  user: CurrentUser | null;
}) => {
  const { ip, prisma, types, user } = props;

  const subscriptionAndUsage = await getUsage({ ip, prisma, user });

  types.forEach((type) => {
    const totalUsage = subscriptionAndUsage.usage[type];
    const limit = getLimitForType(type, user);

    if (totalUsage > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Usage limit exceeded for ${type}`,
      });
    }
  });
};
