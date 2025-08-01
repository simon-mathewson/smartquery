import { z } from 'zod';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';

const subscriptionSchema = z.object({
  startDate: z.date(),
  usage: z.object({
    aiChatInputTokens: z.number().int().nonnegative(),
    aiChatOutputTokens: z.number().int().nonnegative(),
    aiInlineCompletionInputTokens: z.number().int().nonnegative(),
    aiInlineCompletionOutputTokens: z.number().int().nonnegative(),
    queryDurationSeconds: z.number().int().nonnegative(),
    queryResponseBytes: z.number().int().nonnegative(),
  }),
});

export const subscriptionRouter = trpc.router({
  subscription: trpc.procedure
    .use(isAuthenticatedAndPlus)
    .output(subscriptionSchema)
    .query(async (props) => {
      const {
        ctx: { prisma, user },
      } = props;

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
          queryDurationSeconds: 0,
          queryResponseBytes: 0,
        },
      } satisfies z.infer<typeof subscriptionSchema>;

      usageResults.forEach(({ type, _sum }) => {
        response.usage[type] = _sum.amount ?? 0;
      });

      return response;
    }),
});
