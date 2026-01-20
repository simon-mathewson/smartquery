import { generateChatResponse } from './generateChatResponse/generateChatResponse';
import { generateInlineCompletions } from './generateInlineCompletions';
import { generatePromptSuggestions } from './generatePromptSuggestions';
import {
  generateChatResponseInputSchema,
  generateInlineCompletionsInputSchema,
  generatePromptSuggestionsInputSchema,
} from './types';
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
      let inputTokens = 0;
      let cachedInputTokens = 0;

      for await (const chunk of response) {
        if (chunk.usage) {
          inputTokens = chunk.usage.inputTokens;
          cachedInputTokens = chunk.usage.cachedInputTokens;
          outputTokens = chunk.usage.outputTokens;
        }
        yield chunk.text ?? null;
      }

      assert(inputTokens > 0, 'Input tokens should be tracked');

      void trackUsage({
        ip,
        items: [
          {
            amount: getAiCreditsForTokens({
              model: 'gpt-5.1-codex-mini',
              inputTokens,
              cachedInputTokens,
              outputTokens,
            }),
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
                model: 'gpt-5.1-codex-mini',
                inputTokens: response.usage.inputTokens,
                cachedInputTokens: response.usage.cachedInputTokens,
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
  generatePromptSuggestions: trpc.procedure
    .input(generatePromptSuggestionsInputSchema)
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

      const response = await generatePromptSuggestions({
        ...input,
        abortSignal: signal,
        openai,
      });

      if (!response) {
        return [];
      }

      assert(response.usage.inputTokens > 0, 'Input tokens should be tracked');

      void trackUsage({
        ip,
        items: [
          {
            amount: getAiCreditsForTokens({
              model: 'gpt-5.1-codex-mini',
              inputTokens: response.usage.inputTokens,
              cachedInputTokens: response.usage.cachedInputTokens,
              outputTokens: response.usage.outputTokens,
            }),
            type: 'aiCredits',
          },
        ],
        prisma,
        user,
      });

      return response.suggestions;
    }),
});
