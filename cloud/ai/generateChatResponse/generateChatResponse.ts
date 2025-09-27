import type { GenerateContentResponse, GoogleGenAI } from '@google/genai';
import type { GenerateChatResponseInput } from '../types';
import { responseSchema } from './responseSchema';

export type GenerateChatResponseProps = GenerateChatResponseInput & {
  abortSignal: AbortSignal | undefined;
  googleAi: GoogleGenAI;
  schemaDefinitions: string | null;
};

export const generateChatResponse = async function* (
  props: GenerateChatResponseProps,
): AsyncGenerator<GenerateContentResponse, null | undefined, unknown> {
  const { contents, engine, abortSignal, googleAi, schemaDefinitions } = props;

  const systemInstruction = [
    'You are a copilot assistant in a database UI.',
    `The engine is ${engine}.`,

    'When generating SQL, use quotes as necessary, particularly to ensure correct casing.',

    'Return a list where each item is either text using markdown formatting or a query object. Query objects contain a name and a SQL query.',

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
    const response = await googleAi.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        abortSignal,
        candidateCount: 1,
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    for await (const chunk of response) {
      yield chunk;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('exception AbortError:')) {
      return null;
    }
    throw error;
  }
};
