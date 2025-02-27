import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import OpenAI from 'openai';
import { useEffect, useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';

export const useAi = () => {
  const [openAiApiKey, setOpenAiApiKey] = useStoredState<string | undefined>(
    'openAiApiKey',
    undefined,
  );
  const [anthropicApiKey, setAnthropicApiKey] = useStoredState<string | undefined>(
    'anthropicApiKey',
    undefined,
  );

  const [openAi, setOpenAi] = useState<OpenAI | null>(null);

  const [anthropic, setAnthropic] = useState<Anthropic | null>(null);

  useEffect(() => {
    if (openAiApiKey) {
      setOpenAi(new OpenAI({ apiKey: openAiApiKey, dangerouslyAllowBrowser: true }));
    } else {
      setOpenAi(null);
    }

    if (anthropicApiKey) {
      setAnthropic(
        new Anthropic({
          apiKey: anthropicApiKey,
          dangerouslyAllowBrowser: true,
        }),
      );
    } else {
      setAnthropic(null);
    }
  }, [openAiApiKey, anthropicApiKey]);

  return { openAiApiKey, setOpenAiApiKey, openAi, anthropicApiKey, setAnthropicApiKey, anthropic };
};
