import { GoogleGenAI } from '@google/genai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AuthContext } from '../auth/Context';
import { CloudApiContext } from '../cloud/api/Context';
import {
  generateInlineCompletions as sharedGenerateInlineCompletions,
  type GenerateInlineCompletionsProps,
} from '@/ai/generateInlineCompletions';
import { omit } from 'lodash';
import {
  type GenerateChatResponseProps,
  generateChatResponse as sharedGenerateChatResponse,
} from '@/ai/generateChatResponse';

export const useAi = () => {
  const { cloudApi, cloudApiStream } = useDefinedContext(CloudApiContext);
  const auth = useDefinedContext(AuthContext);

  const [googleAiApiKey, setGoogleAiApiKey] = useStoredState<string | undefined>(
    'googleAiApiKey',
    undefined,
  );

  const [googleAi, setGoogleAi] = useState<GoogleGenAI | null>(null);

  useEffect(() => {
    if (googleAiApiKey) {
      setGoogleAi(new GoogleGenAI({ apiKey: googleAiApiKey }));
    } else if (!googleAiApiKey && googleAi) {
      setGoogleAi(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAiApiKey]);

  const generateChatResponse = useCallback(
    async (props: Omit<GenerateChatResponseProps, 'googleAi'>) => {
      try {
        if (auth.user?.subscription?.type === 'plus') {
          return cloudApiStream.ai.generateChatResponse.mutate(omit(props, 'abortSignal'), {
            signal: props.abortSignal,
          });
        }

        assert(googleAi, 'Google AI is not initialized');

        return sharedGenerateChatResponse({ ...props, googleAi });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.startsWith('exception AbortError:') ||
            error.message === 'BodyStreamBuffer was aborted' ||
            error.message.includes('signal is aborted'))
        ) {
          return null;
        }
        throw error;
      }
    },
    [auth.user?.subscription?.type, cloudApiStream, googleAi],
  );

  const generateInlineCompletions = useCallback(
    async (props: Omit<GenerateInlineCompletionsProps, 'googleAi'>) => {
      try {
        if (auth.user?.subscription?.type === 'plus') {
          return cloudApi.ai.generateInlineCompletions.mutate(omit(props, 'abortSignal'), {
            signal: props.abortSignal,
          });
        }

        assert(googleAi, 'Google AI is not initialized');

        return sharedGenerateInlineCompletions({ ...props, googleAi });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.startsWith('exception AbortError:') ||
            error.message === 'BodyStreamBuffer was aborted' ||
            error.message.includes('signal is aborted'))
        ) {
          return null;
        }
      }
    },
    [auth.user?.subscription?.type, cloudApi, googleAi],
  );

  const enabled = auth.user?.subscription?.type === 'plus' || Boolean(googleAi);

  return useMemo(
    () => ({
      enabled,
      generateChatResponse,
      generateInlineCompletions,
      googleAiApiKey,
      setGoogleAiApiKey,
    }),
    [enabled, generateChatResponse, generateInlineCompletions, googleAiApiKey, setGoogleAiApiKey],
  );
};
