import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { prisma } from '~/prisma/client';
import { trpc } from '~/trpc';
import { listSavedQueriesInputSchema } from './types';
import { z } from 'zod';
import { savedQuerySchema } from '@/savedQueries/types';

export const savedQueriesRouter = trpc.router({
  list: trpc.procedure
    .use(isAuthenticated)
    .input(listSavedQueriesInputSchema)
    .output(z.array(savedQuerySchema))
    .query(async (props) => {
      const {
        ctx: { user },
        input: { connectionId, database },
      } = props;

      return prisma.savedQuery.findMany({
        where: {
          userId: user.id,
          connectionId,
          database,
        },
        select: {
          id: true,
          name: true,
          sql: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    }),
});
