import { aiTextContentSchema } from '@/ai/types';
import { engineSchema } from '@/connections/types';
import { z } from 'zod';

export const generateChatResponseInputSchema = z.object({
  contents: z.array(aiTextContentSchema).min(1),
  engine: engineSchema,
  schemaDefinitions: z.string().min(1).nullable(),
});

export type GenerateChatResponseInput = z.infer<typeof generateChatResponseInputSchema>;

export const generateInlineCompletionsInputSchema = z.object({
  codeBeforeCursor: z.string(),
  codeAfterCursor: z.string(),
  language: z.string().min(1).nullable(),
  schemaDefinitions: z.string().min(1).nullable(),
});

export type GenerateInlineCompletionsInput = z.infer<typeof generateInlineCompletionsInputSchema>;
