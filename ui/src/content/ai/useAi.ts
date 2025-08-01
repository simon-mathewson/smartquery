import type { AiTextContent } from '@/ai/types';
import { GoogleGenAI } from '@google/genai';
import { useCallback, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AuthContext } from '../auth/Context';
import { CloudApiContext } from '../cloud/api/Context';

export const useAi = () => {
  const { cloudApiStream } = useDefinedContext(CloudApiContext);
  const auth = useDefinedContext(AuthContext);

  const [googleAiApiKey, setGoogleAiApiKey] = useStoredState<string | undefined>(
    'googleAiApiKey',
    undefined,
  );

  const [googleAi, setGoogleAi] = useState<GoogleGenAI | null>(null);

  if (googleAiApiKey && !googleAi) {
    setGoogleAi(new GoogleGenAI({ apiKey: googleAiApiKey }));
  } else if (!googleAiApiKey && googleAi) {
    setGoogleAi(null);
  }

  const generateContent = useCallback(
    async (props: {
      abortSignal: AbortSignal | undefined;
      contents: AiTextContent[];
      systemInstructions: string;
      temperature?: number;
    }) => {
      const { abortSignal, contents, systemInstructions, temperature } = props;

      if (auth.user?.subscription?.type === 'plus') {
        return cloudApiStream.ai.generateContent.mutate(
          { contents, systemInstructions, temperature },
          { signal: abortSignal },
        );
      }

      assert(googleAi, 'Google AI is not initialized');

      const stream = await googleAi.models.generateContentStream({
        model: 'gemini-2.0-flash',
        config: {
          abortSignal,
          systemInstruction: systemInstructions,
          temperature,
        },
        contents,
      });

      return (async function* () {
        for await (const chunk of stream) {
          yield chunk.text;
        }
      })();
    },
    [auth.user?.subscription, cloudApiStream, googleAi],
  );

  const enabled = auth.user?.subscription?.type === 'plus' || Boolean(googleAi);

  return useMemo(
    () => ({
      enabled,
      generateContent,
      googleAiApiKey,
      setGoogleAiApiKey,
    }),
    [enabled, generateContent, googleAiApiKey, setGoogleAiApiKey],
  );
};
