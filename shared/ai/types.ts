import { z } from 'zod';

export const aiTextContentSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(
    z.object({
      text: z.string().min(1),
    }),
  ),
});

export type AiTextContent = z.infer<typeof aiTextContentSchema>;
