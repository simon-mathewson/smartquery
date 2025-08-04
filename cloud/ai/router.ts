import { generateChatResponse } from '@/ai/generateChatResponse';
import { generateInlineCompletions } from '@/ai/generateInlineCompletions';
import { generateChatResponseInputSchema, generateInlineCompletionsInputSchema } from '@/ai/types';
import { isAuthenticatedAndPlus } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';

export const aiRouter = trpc.router({
  generateChatResponse: trpc.procedure
    .input(generateChatResponseInputSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { googleAi },
        input,
        signal,
      } = props;

      return generateChatResponse({ ...input, abortSignal: signal, googleAi });
    }),
  generateInlineCompletions: trpc.procedure
    .input(generateInlineCompletionsInputSchema)
    .use(isAuthenticatedAndPlus)
    .mutation(async (props) => {
      const {
        ctx: { googleAi },
        input,
        signal,
      } = props;

      return generateInlineCompletions({ ...input, abortSignal: signal, googleAi });
    }),
});
