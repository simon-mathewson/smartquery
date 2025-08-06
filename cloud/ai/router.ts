import { generateChatResponse } from '@/ai/generateChatResponse';
import { generateInlineCompletions } from '@/ai/generateInlineCompletions';
import { generateChatResponseInputSchema, generateInlineCompletionsInputSchema } from '@/ai/types';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import { trackUsage } from '~/subscription/trackUsage';
import { verifyUsageWithinLimits } from '~/subscription/verifyUsageWithinLimits';
import { trpc } from '~/trpc';
import assert from 'assert';

export const aiRouter = trpc.router({
  generateChatResponse: trpc.procedure
    .input(generateChatResponseInputSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async function* (props) {
      const {
        ctx: { googleAi, prisma, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        prisma,
        types: ['aiChatInputTokens', 'aiChatOutputTokens'],
        user,
      });

      const response = generateChatResponse({ ...input, abortSignal: signal, googleAi });

      let outputTokens = 0;
      let inputTokens: number | null = null;

      for await (const chunk of response) {
        outputTokens += chunk.usageMetadata?.candidatesTokenCount ?? 0;
        if (inputTokens === null) {
          inputTokens = chunk.usageMetadata?.promptTokenCount ?? 0;
        }
        yield chunk.text ?? null;
      }

      assert(inputTokens !== null, 'Input tokens should be tracked');

      void trackUsage({
        items: [
          { amount: inputTokens, type: 'aiChatInputTokens' },
          { amount: outputTokens, type: 'aiChatOutputTokens' },
        ],
        prisma,
        userId: user.id,
      });

      return null;
    }),
  generateInlineCompletions: trpc.procedure
    .input(generateInlineCompletionsInputSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { googleAi, prisma, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        prisma,
        types: ['aiInlineCompletionInputTokens', 'aiInlineCompletionOutputTokens'],
        user,
      });

      const response = await generateInlineCompletions({ ...input, abortSignal: signal, googleAi });

      if (response) {
        void trackUsage({
          items: [
            {
              amount: response.usageMetadata?.promptTokenCount ?? 0,
              type: 'aiInlineCompletionInputTokens',
            },
            {
              amount: response.usageMetadata?.candidatesTokenCount ?? 0,
              type: 'aiInlineCompletionOutputTokens',
            },
          ],
          prisma,
          userId: user.id,
        });
      }

      return response?.text ?? null;
    }),
});
