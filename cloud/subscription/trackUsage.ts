import type { PrismaClient, UsageType } from '~/prisma/generated';

export const trackUsage = async (props: {
  items: Array<{
    amount: number;
    type: UsageType;
  }>;
  prisma: PrismaClient;
  userId: string;
}) => {
  const { prisma, userId, items } = props;

  await prisma.usage.createMany({
    data: items.map((item) => ({
      amount: item.amount,
      type: item.type,
      userId,
    })),
  });
};
