import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { assert } from 'ts-essentials';
import {
  CHAT_RESPONSE_BASE_INSTRUCTIONS,
  INLINE_COMPLETION_BASE_INSTRUCTIONS,
  generatePromptCacheKey,
} from './instructions';
import { responseSchema } from './responseSchema';
import { promptSuggestionsSchema } from './responseSchema';
import type { AiTextContent } from '@/ai/types';

const MODEL = 'gpt-4o-mini';

export type GenerateChatResponseParams = {
  contents: AiTextContent[];
  engine: string;
  schemaDefinitions: string | null;
  abortSignal?: AbortSignal;
};

export async function* generateChatResponse(
  apiKey: string,
  params: GenerateChatResponseParams,
): AsyncGenerator<string | null, null, unknown> {
  const { contents, engine, schemaDefinitions, abortSignal } = params;
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const systemMessage = [
    CHAT_RESPONSE_BASE_INSTRUCTIONS,
    `The engine is ${engine}.`,
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join('\n');

  const promptCacheKey = generatePromptCacheKey(systemMessage);

  try {
    const stream = await openai.responses.create(
      {
        instructions: systemMessage,
        model: MODEL,
        input: contents,
        text: {
          format: zodTextFormat(responseSchema, 'response'),
        },
        stream: true,
        prompt_cache_key: promptCacheKey,
      },
      { signal: abortSignal },
    );

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta;
      }
      if (event.type === 'response.completed') {
        // usage available on event.response.usage if needed
      }
      if (event.type === 'error') {
        throw new Error(event.message);
      }
    }
    return null;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('exception AbortError:') || error.name === 'AbortError')
    ) {
      return null;
    }
    throw error;
  }
}

export type GenerateInlineCompletionsParams = {
  codeBeforeCursor: string;
  codeAfterCursor: string;
  language: string | null;
  schemaDefinitions: string | null;
  abortSignal?: AbortSignal;
};

export async function generateInlineCompletions(
  apiKey: string,
  params: GenerateInlineCompletionsParams,
): Promise<string | null> {
  const { codeBeforeCursor, codeAfterCursor, language, schemaDefinitions, abortSignal } = params;
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const systemMessage = [
    INLINE_COMPLETION_BASE_INSTRUCTIONS,
    ...(language ? [`The language is ${language}.`] : []),
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join('\n');

  const promptCacheKey = generatePromptCacheKey(systemMessage);

  console.log(`${codeBeforeCursor}<CURSOR>${codeAfterCursor}`);
  try {
    const response = await openai.responses.create(
      {
        model: MODEL,
        instructions: systemMessage,
        input: [
          {
            role: 'user',
            content: `${codeBeforeCursor}<CURSOR>${codeAfterCursor}`,
          },
        ],
        prompt_cache_key: promptCacheKey,
      },
      { signal: abortSignal },
    );

    assert(response.usage, 'Usage should be present');
    return response.output_text ?? null;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('exception AbortError:') || error.name === 'AbortError')
    ) {
      return null;
    }
    throw error;
  }
}

export type GeneratePromptSuggestionsParams = {
  engine: string;
  schemaDefinitions: string;
  abortSignal?: AbortSignal;
};

export async function generatePromptSuggestions(
  apiKey: string,
  params: GeneratePromptSuggestionsParams,
): Promise<string[]> {
  const { schemaDefinitions, engine, abortSignal } = params;
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

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
        model: MODEL,
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
      { signal: abortSignal },
    );

    assert(response.output_text, 'Output text should be present');
    const parsed = promptSuggestionsSchema.parse(JSON.parse(response.output_text));
    return parsed.suggestions;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('exception AbortError:') || error.name === 'AbortError')
    ) {
      return [];
    }
    throw error;
  }
}
