import type OpenAI from 'openai';
import type { GenerateChatResponseInput } from '../types';
import { responseSchema } from './responseSchema';
import { zodTextFormat } from 'openai/helpers/zod';
import assert from 'assert';
import { CHAT_RESPONSE_BASE_INSTRUCTIONS, generatePromptCacheKey } from '../cacheKey';

export type GenerateChatResponseProps = GenerateChatResponseInput & {
  abortSignal: AbortSignal | undefined;
  openai: OpenAI;
  schemaDefinitions: string | null;
};

type StreamChunk = {
  text?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};

export const generateChatResponse = async function* (
  props: GenerateChatResponseProps,
): AsyncGenerator<StreamChunk, null | undefined, unknown> {
  const { contents, engine, abortSignal, openai, schemaDefinitions } = props;

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
        model: 'gpt-5.1-codex-mini',
        input: contents,
        text: {
          format: zodTextFormat(responseSchema, 'response'),
        },
        stream: true,
        prompt_cache_key: promptCacheKey,
      },
      {
        signal: abortSignal,
      },
    );

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield { text: event.delta };
      }

      if (event.type === 'response.completed') {
        assert(event.response.usage, 'Usage should be present');
        yield {
          usage: {
            inputTokens: event.response.usage.input_tokens,
            outputTokens: event.response.usage.output_tokens,
          },
        };
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
};
