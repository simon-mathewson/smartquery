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

    'Return a list of text sections as well as query objects if necessary. Query objects contain a name and a SQL query.',

    'Suggest a chart in the query object if it is useful to visualize the data.',
    'xColumn: The alias (AS XYZ) or name (if no alias) of the column for the x-axis of line and bar charts, and for the categories of pie charts. If line chart, only allows continiuous data types like numbers or datetimes.',
    'xTable: The alias (AS XYZ) or name (if no alias) of the table of xColumn. If xColumn is not associated with a table (e.g. virtual), xTable should be null.',
    'yColumn: The alias (AS XYZ) or name (if no alias) of the column for the y-axis of line and bar charts, and for the values of pie charts. Only allows numeric data types.',
    'yTable: The alias (AS XYZ) or name (if no alias) of the table of yColumn. If yColumn is not associated with a table (e.g. virtual), yTable should be null.',

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
