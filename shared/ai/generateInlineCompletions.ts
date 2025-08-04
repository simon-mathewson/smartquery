import { GoogleGenAI } from "@google/genai";
import { GenerateInlineCompletionsInput } from "./types";

export type GenerateInlineCompletionsProps = GenerateInlineCompletionsInput & {
  abortSignal: AbortSignal | undefined;
  googleAi: GoogleGenAI;
};

export const generateInlineCompletions = async (
  props: GenerateInlineCompletionsProps
) => {
  const {
    googleAi,
    codeBeforeCursor,
    codeAfterCursor,
    language,
    abortSignal,
    schemaDefinitions,
  } = props;

  const systemInstruction = [
    `You are an AI assistant in a code editor that provides valid and unformatted ${
      language ? `${language} ` : ""
    }inline code completions. Given a code snippet, return only the exact code to insert at <CURSOR>.`,
    "Do not include markdown, explanations, comments, or any additional text.",
    "Do not wrap the response in triple backticks or any formatting.",
    "Do not escape slashes if a special character should be rendered.",
    "If the insertion should start on a new line, begin your response with a newline character.",
    "If the code is already complete, return nothing.",
    ...(schemaDefinitions
      ? [`\n\nThe schema definitions are as follows:\n\n${schemaDefinitions}`]
      : []),
  ].join("\n");

  try {
    const response = await googleAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${codeBeforeCursor}<CURSOR>${codeAfterCursor}` }],
        },
      ],
      config: {
        abortSignal: abortSignal,
        candidateCount: 1,
        systemInstruction,
        temperature: 0,
      },
    });

    return response;
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
