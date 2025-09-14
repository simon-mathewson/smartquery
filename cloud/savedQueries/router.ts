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
        input: { chart, connectionId, database, name, sql },
      } = props;

      const { id } = await prisma.savedQuery.create({
        data: {
          chart: chart ? { create: chart } : undefined,
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
          chart: { select: { type: true, x: true, y: true } },
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
        input: { chart, id, name, sql },
      } = props;

      const getChartInput = () => {
        if (chart === null) {
          return {
            delete: true,
          };
        }
        if (chart === undefined) {
          return undefined;
        }
        return {
          update: chart,
        };
      };

      await prisma.savedQuery.update({
        where: { id, userId: user.id },
        data: {
          chart: getChartInput(),
          name,
          sql,
        },
      });
    }),
});
