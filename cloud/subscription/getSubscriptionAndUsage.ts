import type { PrismaClient } from '~/prisma/generated';
import type { CurrentUser } from '~/context';
import type { subscriptionSchema } from './types';
import type { z } from 'zod';

export const getSubscriptionAndUsage = async (props: {
  prisma: PrismaClient;
  user: CurrentUser;
}) => {
  const { prisma, user } = props;

  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageResults = await prisma.usage.groupBy({
    where: {
      createdAt: { gte: startOfMonth },
      userId: user.id,
    },
    by: ['type'],
    _sum: { amount: true },
  });

  const response = {
    startDate: subscription.startDate,
    usage: {
      aiChatInputTokens: 0,
      aiChatOutputTokens: 0,
      aiInlineCompletionInputTokens: 0,
      aiInlineCompletionOutputTokens: 0,
      queryDurationMilliseconds: 0,
      queryResponseBytes: 0,
    },
  } satisfies z.infer<typeof subscriptionSchema>;

  usageResults.forEach(({ type, _sum }) => {
    response.usage[type] = _sum.amount ?? 0;
  });

  return response;
};
