import type OpenAI from 'openai';
import type { GenerateInlineCompletionsInput } from './types';
import assert from 'assert';

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
    `You are an AI assistant in a code editor that provides valid and unformatted ${
      language ? `${language} ` : ''
    }inline code completions. Given a code snippet, return only the exact code to insert at <CURSOR>.`,
    'Do not include markdown, explanations, comments, or any additional text.',
    'Do not wrap the response in triple backticks or any formatting.',
    'Do not escape slashes if a special character should be rendered.',
    'If the insertion should start on a new line, begin your response with a newline character.',
    'If the code is already complete, return nothing.',
    'Use quotes where appropriate if the Database engine requires them.',
    'Match the case of the input code',
    'If cursor is in middle of word, return the remaining characters. Example: "SEL<CURSOR>" -> "SELECT"',
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join('\n');

  try {
    const response = await openai.responses.create(
      {
        model: 'gpt-5-nano',
        instructions: systemMessage,
        input: [
          {
            role: 'user',
            content: `${codeBeforeCursor}<CURSOR>${codeAfterCursor}`,
          },
        ],
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
