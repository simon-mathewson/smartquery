import type { Results } from '@/connector/runQuery';
import type { PrismaClient } from '~/prisma/generated';
import type { CurrentUser } from '~/context';
import superjson from 'superjson';

export const trackQueryResponseBytes = async (props: {
  prisma: PrismaClient;
  user: CurrentUser;
  results: Results;
}) => {
  const { prisma, user, results } = props;

  const queryResponseBytes = Buffer.byteLength(superjson.stringify(results), 'utf-8');

  await prisma.usage.create({
    data: {
      amount: queryResponseBytes,
      type: 'queryResponseBytes',
      userId: user.id,
    },
  });
};
