import assert from 'assert';
import type { CurrentUser } from '~/context';
import type { PrismaClient, UsageType } from '~/prisma/generated';

export const trackUsage = async (props: {
  ip: string | undefined;
  items: Array<{
    amount: number;
    type: UsageType;
  }>;
  prisma: PrismaClient;
  user: CurrentUser | null;
}) => {
  const { ip, prisma, user, items } = props;

  assert(user || ip, 'User or ip must be provided');

  await prisma.usage.createMany({
    data: items.map((item) => ({
      amount: item.amount,
      type: item.type,
      userId: user?.id,
      ip: user ? undefined : ip,
    })),
  });
};
