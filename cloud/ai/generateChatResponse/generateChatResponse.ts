import type OpenAI from 'openai';
import type { GenerateChatResponseInput } from '../types';
import { responseSchema } from './responseSchema';
import { zodTextFormat } from 'openai/helpers/zod';
import assert from 'assert';

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
    'You are a copilot assistant in a database UI.',
    `The engine is ${engine}.`,

    'When generating SQL, use quotes as necessary, particularly to ensure correct casing.',

    'Return a list where each item is either text using markdown formatting or a query object. Query objects contain a name and a SQL query, formatted with newlines and indentation.',

    'Suggest a chart in the query object only if it is useful to visualize the data. Do not suggest a chart if the data is not suitable for visualization, particularly if there is no numerical column for the y-axis.',
    'xColumn: The alias or name of the column for the x-axis of line and bar charts, and for the categories of pie charts. If line chart, only return continiuous data types like numbers or datetimes.',
    'xTable: The alias or name of the table of xColumn. Specify if column name is ambiguous, otherwise return null.',
    'yColumn: The alias or name of the column for the y-axis of line and bar charts, and for the values of pie charts. Only return numeric data types.',
    'yTable: The alias or name of the table of yColumn. Specify if column name is ambiguous, otherwise return null.',

    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join('\n');

  try {
    const stream = await openai.responses.create(
      {
        instructions: systemMessage,
        model: 'gpt-5-mini',
        input: contents,
        text: {
          format: zodTextFormat(responseSchema, 'response'),
        },
        stream: true,
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
