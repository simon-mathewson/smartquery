import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export const useAi = () => {
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

  return {
    googleAi,
    googleAiApiKey,
    setGoogleAiApiKey,
  };
};
