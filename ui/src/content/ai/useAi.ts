import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useAi = () => {
  const [googleAiApiKey, setGoogleAiApiKey] = useStoredState<string | undefined>(
    'googleAiApiKey',
    undefined,
  );

  const [googleAi, setGoogleAi] = useState<GoogleGenerativeAI | null>(null);

  if (googleAiApiKey && !googleAi) {
    setGoogleAi(new GoogleGenerativeAI(googleAiApiKey));
  } else if (!googleAiApiKey && googleAi) {
    setGoogleAi(null);
  }

  return {
    googleAi,
    googleAiApiKey,
    setGoogleAiApiKey,
  };
};
