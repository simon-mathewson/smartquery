import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GenerateChatResponseInput } from "./types";

export type GenerateChatResponseProps = GenerateChatResponseInput & {
  abortSignal: AbortSignal | undefined;
  googleAi: GoogleGenAI;
  schemaDefinitions: string | null;
};

export const generateChatResponse = async function* (
  props: GenerateChatResponseProps
): AsyncGenerator<GenerateContentResponse, null | undefined, unknown> {
  const { contents, engine, abortSignal, googleAi, schemaDefinitions } = props;

  const systemInstruction = [
    "You are a copilot assistant in a database UI.",
    `The engine is ${engine}.`,
    "When generating SQL, use quotes as necessary, particularly to ensure correct casing.",
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join("\n");

  try {
    const response = await googleAi.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        abortSignal,
        candidateCount: 1,
        systemInstruction,
      },
    });

    for await (const chunk of response) {
      yield chunk;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("exception AbortError:")
    ) {
      return null;
    }
    throw error;
  }
};
