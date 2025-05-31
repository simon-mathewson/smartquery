import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '../trpc';

export const connectionsRouter = trpc.router({
  list: trpc.procedure.use(isAuthenticated).query(async ({ ctx: { prisma, user } }) => {
    const connections = await prisma.connection.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return connections;
  }),
});
