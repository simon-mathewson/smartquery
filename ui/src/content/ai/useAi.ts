import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const useAi = () => {
  const [aiProvider, setAiProvider] = useStoredState<'google' | 'openai' | undefined>(
    'aiProvider',
    undefined,
  );

  const [openAiApiKey, setOpenAiApiKey] = useStoredState<string | undefined>(
    'openAiApiKey',
    undefined,
  );

  const [googleAiApiKey, setGoogleAiApiKey] = useStoredState<string | undefined>(
    'googleAiApiKey',
    undefined,
  );

  const [openAi, setOpenAi] = useState<OpenAI | null>(null);

  const [googleAi, setGoogleAi] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    if (aiProvider === 'openai' && openAiApiKey) {
      setOpenAi(new OpenAI({ apiKey: openAiApiKey, dangerouslyAllowBrowser: true }));
    } else {
      setOpenAi(null);
    }

    if (aiProvider === 'google' && googleAiApiKey) {
      setGoogleAi(new GoogleGenerativeAI(googleAiApiKey));
    } else {
      setGoogleAi(null);
    }
  }, [aiProvider, openAiApiKey, googleAiApiKey]);

  return {
    aiProvider,
    googleAi,
    googleAiApiKey,
    openAi,
    openAiApiKey,
    setAiProvider,
    setGoogleAiApiKey,
    setOpenAiApiKey,
  };
};
