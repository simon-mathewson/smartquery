import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { prisma } from '~/prisma/client';
import { trpc } from '~/trpc';
import {
  createSavedQueryInputSchema,
  listSavedQueriesInputSchema,
  updateSavedQueryInputSchema,
} from './types';
import { z } from 'zod';
import { savedQuerySchema } from '@/savedQueries/types';

export const savedQueriesRouter = trpc.router({
  create: trpc.procedure
    .use(isAuthenticated)
    .input(createSavedQueryInputSchema)
    .output(z.string())
    .mutation(async (props) => {
      const {
        ctx: { user },
        input: { connectionId, database, name, sql },
      } = props;

      const { id } = await prisma.savedQuery.create({
        data: {
          connectionId,
          database,
          userId: user.id,
          name,
          sql,
        },
      });

      return id;
    }),
  delete: trpc.procedure
    .use(isAuthenticated)
    .input(z.string())
    .mutation(async (props) => {
      const {
        ctx: { user },
        input: id,
      } = props;
      await prisma.savedQuery.delete({ where: { id, userId: user.id } });
    }),
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
  update: trpc.procedure
    .use(isAuthenticated)
    .input(updateSavedQueryInputSchema)
    .mutation(async (props) => {
      const {
        ctx: { user },
        input: { id, name, sql },
      } = props;

      await prisma.savedQuery.update({
        where: { id, userId: user.id },
        data: {
          name,
          sql,
        },
      });
    }),
});
