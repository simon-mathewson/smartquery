import { z } from 'zod';

export const subscriptionSchema = z.object({
  startDate: z.date(),
  usage: z.object({
    aiChatInputTokens: z.number().int().nonnegative(),
    aiChatOutputTokens: z.number().int().nonnegative(),
    aiInlineCompletionInputTokens: z.number().int().nonnegative(),
    aiInlineCompletionOutputTokens: z.number().int().nonnegative(),
    queryDurationMilliseconds: z.number().int().nonnegative(),
    queryResponseBytes: z.number().int().nonnegative(),
  }),
});
