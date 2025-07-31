import { aiTextContentSchema } from '@/types/ai';
import { z } from 'zod';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';

export const aiRouter = trpc.router({
  generateContent: trpc.procedure
    .input(
      z.object({
        contents: z.array(aiTextContentSchema).min(1),
        systemInstructions: z.string().min(1),
        temperature: z.number().min(0).max(1).optional(),
      }),
    )
    .use(isAuthenticatedAndPlus)
    .mutation(async function* (props) {
      const {
        input: { contents, systemInstructions, temperature },
        ctx,
        signal,
      } = props;

      try {
        const response = await ctx.googleAi.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            abortSignal: signal,
            systemInstruction: systemInstructions,
            temperature,
          },
        });

        for await (const chunk of response) {
          yield chunk.text;
        }
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('exception AbortError:')) {
          return;
        }
        throw error;
      }
    }),
});
