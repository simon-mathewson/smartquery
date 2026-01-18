import type OpenAI from 'openai';
import type { GenerateInlineCompletionsInput } from './types';
import assert from 'assert';
import { INLINE_COMPLETION_BASE_INSTRUCTIONS, generatePromptCacheKey } from './instructions';

export type GenerateInlineCompletionsProps = GenerateInlineCompletionsInput & {
  abortSignal: AbortSignal | undefined;
  openai: OpenAI;
};

type InlineCompletionResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

export const generateInlineCompletions = async (
  props: GenerateInlineCompletionsProps,
): Promise<InlineCompletionResponse | null> => {
  const { openai, codeBeforeCursor, codeAfterCursor, language, abortSignal, schemaDefinitions } =
    props;

  const systemMessage = [
    INLINE_COMPLETION_BASE_INSTRUCTIONS,
    ...(language ? [`The language is ${language}.`] : []),
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join('\n');

  const promptCacheKey = generatePromptCacheKey(systemMessage);

  try {
    const response = await openai.responses.create(
      {
        model: 'gpt-5.1-codex-mini',
        instructions: systemMessage,
        input: [
          {
            role: 'user',
            content: `${codeBeforeCursor}<CURSOR>${codeAfterCursor}`,
          },
        ],
        prompt_cache_key: promptCacheKey,
      },
      {
        signal: abortSignal,
      },
    );

    assert(response.usage, 'Usage should be present');

    return {
      text: response.output_text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('exception AbortError:') || error.name === 'AbortError')
    ) {
      return null;
    }
    throw error;
  }
};
