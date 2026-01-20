import type OpenAI from 'openai';
import { generatePromptCacheKey } from './instructions';
import assert from 'assert';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

export type GeneratePromptSuggestionsProps = {
  openai: OpenAI;
  schemaDefinitions: string;
  engine: string;
  abortSignal?: AbortSignal;
};

export type GeneratePromptSuggestionsResponse = {
  suggestions: string[];
  usage: {
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
  };
};

const promptSuggestionsSchema = z.object({
  suggestions: z.array(z.string()).length(5),
});

export const generatePromptSuggestions = async (
  props: GeneratePromptSuggestionsProps,
): Promise<GeneratePromptSuggestionsResponse | null> => {
  const { openai, schemaDefinitions, engine, abortSignal } = props;

  const systemMessage = [
    'You are an AI assistant that generates helpful database query suggestions based on schema definitions.',
    'Generate exactly 5 diverse and useful prompt suggestions that users might want to ask about their database.',
    'Each suggestion should be a natural language question or request that would help users explore their database.',
    'Make suggestions specific to the tables and columns in the schema, focusing on common analytical queries like aggregations, trends, distributions, and comparisons.',
    'Keep each suggestion concise (under 100 characters).',
    `The database engine is ${engine}.`,
    `\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`,
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
            content: 'Generate 5 prompt suggestions based on the schema definitions.',
          },
        ],
        text: {
          format: zodTextFormat(promptSuggestionsSchema, 'suggestions'),
        },
        prompt_cache_key: promptCacheKey,
      },
      {
        signal: abortSignal,
      },
    );

    assert(response.output_text, 'Output text should be present');
    assert(response.usage, 'Usage should be present');

    // When using zodTextFormat, output_text is a JSON string that needs to be parsed
    const parsed = promptSuggestionsSchema.parse(JSON.parse(response.output_text));

    return {
      suggestions: parsed.suggestions,
      usage: {
        inputTokens: response.usage.input_tokens,
        cachedInputTokens: response.usage.input_tokens_details.cached_tokens,
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
