import { z } from 'zod';

export const aiTextContentSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(
    z.object({
      text: z.string(),
    }),
  ),
});

export type AiTextContent = z.infer<typeof aiTextContentSchema>;
