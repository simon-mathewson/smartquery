import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '../trpc';
import { connectionSchema } from '@/types/connection';
import { z } from 'zod';
import { mapConnectionToPrisma, mapPrismaToConnection } from './mapPrisma';
import { createConnectionInputSchema, updateConnectionInputSchema } from './schemas';

export const connectionsRouter = trpc.router({
  create: trpc.procedure
    .use(isAuthenticated)
    .input(createConnectionInputSchema)
    .mutation(async ({ input, ctx: { prisma, user } }) => {
      await prisma.connection.create({
        data: {
          ...mapConnectionToPrisma(input),
          userId: user.id,
        },
      });
    }),
  delete: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { prisma, user } }) => {
      await prisma.connection.delete({
        where: { id: input.id, userId: user.id },
      });
    }),
  list: trpc.procedure
    .use(isAuthenticated)
    .output(z.array(connectionSchema))
    .query(async ({ ctx: { prisma, user } }) => {
      const connections = await prisma.connection.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return connections.map(mapPrismaToConnection);
    }),
  update: trpc.procedure
    .use(isAuthenticated)
    .input(updateConnectionInputSchema)
    .mutation(async ({ input, ctx: { prisma, user } }) => {
      await prisma.connection.update({
        where: { id: input.id, userId: user.id },
        data: mapConnectionToPrisma(input),
      });
    }),
});
