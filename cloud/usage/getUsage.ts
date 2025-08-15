import type { PrismaClient } from '~/prisma/generated';
import type { usageSchema } from './types';
import type { z } from 'zod';
import type { CurrentUser } from '~/context';

export const getUsage = async (props: { prisma: PrismaClient; user: CurrentUser }) => {
  const { prisma, user } = props;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const subscription = user.activeSubscription;

  const billingPeriodStartDate = subscription?.startDate
    ? new Date(Math.max(subscription.startDate.getTime(), startOfMonth.getTime()))
    : startOfMonth;

  const usageResults = await prisma.usage.groupBy({
    where: {
      createdAt: { gte: billingPeriodStartDate },
      userId: user.id,
    },
    by: ['type'],
    _sum: { amount: true },
  });

  const response = {
    billingPeriodStartDate,
    usage: {
      aiCredits: 0,
      queryDurationMilliseconds: 0,
      queryResponseBytes: 0,
    },
  } satisfies z.infer<typeof usageSchema>;

  usageResults.forEach(({ type, _sum }) => {
    response.usage[type] = _sum.amount ?? 0;
  });

  return response;
};
