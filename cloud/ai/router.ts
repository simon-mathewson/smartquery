import { generateChatResponse } from './generateChatResponse';
import { generateInlineCompletions } from './generateInlineCompletions';
import { generateChatResponseInputSchema, generateInlineCompletionsInputSchema } from './types';
import { trackUsage } from '~/usage/trackUsage';
import { verifyUsageWithinLimits } from '~/usage/verifyUsageWithinLimits';
import { trpc } from '~/trpc';
import assert from 'assert';
import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { getAiCreditsForTokens } from '~/usage/getAiCreditsForTokens';
import { prisma } from '~/prisma/client';

export const aiRouter = trpc.router({
  generateChatResponse: trpc.procedure
    .input(generateChatResponseInputSchema)
    .use(isAuthenticated)
    .mutation(async function* (props) {
      const {
        ctx: { googleAi, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        prisma,
        types: ['aiCredits'],
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
          {
            amount: getAiCreditsForTokens({ inputTokens, outputTokens }),
            type: 'aiCredits',
          },
        ],
        prisma,
        userId: user.id,
      });

      return null;
    }),
  generateInlineCompletions: trpc.procedure
    .input(generateInlineCompletionsInputSchema)
    .use(isAuthenticated)
    .mutation(async (props) => {
      const {
        ctx: { googleAi, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        prisma,
        types: ['aiCredits'],
        user,
      });

      const response = await generateInlineCompletions({ ...input, abortSignal: signal, googleAi });

      if (response) {
        void trackUsage({
          items: [
            {
              amount: getAiCreditsForTokens({
                inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
              }),
              type: 'aiCredits',
            },
          ],
          prisma,
          userId: user.id,
        });
      }

      return response?.text ?? null;
    }),
});
