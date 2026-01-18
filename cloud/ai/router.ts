import { generateChatResponse } from './generateChatResponse/generateChatResponse';
import { generateInlineCompletions } from './generateInlineCompletions';
import { generateChatResponseInputSchema, generateInlineCompletionsInputSchema } from './types';
import { trackUsage } from '~/usage/trackUsage';
import { verifyUsageWithinLimits } from '~/usage/verifyUsageWithinLimits';
import { trpc } from '~/trpc';
import assert from 'assert';
import { getAiCreditsForTokens } from '~/usage/getAiCreditsForTokens';
import { prisma } from '~/prisma/client';

export const aiRouter = trpc.router({
  generateChatResponse: trpc.procedure
    .input(generateChatResponseInputSchema)
    .mutation(async function* (props) {
      const {
        ctx: { openai, ip, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        ip,
        prisma,
        types: ['aiCredits'],
        user,
      });

      const response = generateChatResponse({ ...input, abortSignal: signal, openai });

      let outputTokens = 0;
      let inputTokens: number | null = null;

      for await (const chunk of response) {
        if (chunk.usage) {
          outputTokens = chunk.usage.inputTokens;
          inputTokens = chunk.usage.outputTokens;
        }
        yield chunk.text ?? null;
      }

      assert(inputTokens !== null, 'Input tokens should be tracked');

      void trackUsage({
        ip,
        items: [
          {
            amount: getAiCreditsForTokens({ model: 'gpt-5-mini', inputTokens, outputTokens }),
            type: 'aiCredits',
          },
        ],
        prisma,
        user,
      });

      return null;
    }),
  generateInlineCompletions: trpc.procedure
    .input(generateInlineCompletionsInputSchema)
    .mutation(async (props) => {
      const {
        ctx: { openai, ip, user },
        input,
        signal,
      } = props;

      await verifyUsageWithinLimits({
        ip,
        prisma,
        types: ['aiCredits'],
        user,
      });

      const response = await generateInlineCompletions({ ...input, abortSignal: signal, openai });

      if (response) {
        void trackUsage({
          ip,
          items: [
            {
              amount: getAiCreditsForTokens({
                model: 'gpt-5-nano',
                inputTokens: response.usage.inputTokens,
                outputTokens: response.usage.outputTokens,
              }),
              type: 'aiCredits',
            },
          ],
          prisma,
          user,
        });
      }

      return response?.text ?? null;
    }),
});
