import type { PrismaClient, UsageType } from '~/prisma/generated';
import type { CurrentUser } from '~/context';
import { plans } from '@/subscriptions/plans';
import { getSubscriptionAndUsage } from './getSubscriptionAndUsage';
import { TRPCError } from '@trpc/server';

const usageTypeToLimit: Record<UsageType, number> = {
  aiChatInputTokens: plans.plus.limits.aiCredits,
  aiChatOutputTokens: plans.plus.limits.aiCredits,
  aiInlineCompletionInputTokens: plans.plus.limits.aiCredits,
  aiInlineCompletionOutputTokens: plans.plus.limits.aiCredits,
  queryDurationMilliseconds: plans.plus.limits.totalQueryDurationMilliseconds,
  queryResponseBytes: plans.plus.limits.totalQueryResponseBytes,
};

export const verifyUsageWithinLimits = async (props: {
  prisma: PrismaClient;
  types: UsageType[];
  user: CurrentUser;
}) => {
  const { prisma, types, user } = props;

  const subscriptionAndUsage = await getSubscriptionAndUsage({ prisma, user });

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
