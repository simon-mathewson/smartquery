import { z } from 'zod';

export const aiTextContentSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export type AiTextContent = z.infer<typeof aiTextContentSchema>;
