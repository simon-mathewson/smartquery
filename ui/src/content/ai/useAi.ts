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
    async function* (props: Omit<GenerateChatResponseProps, 'googleAi'>) {
      try {
        if (auth.user?.subscription) {
          const cloudResponse = await cloudApiStream.ai.generateChatResponse.mutate(
            omit(props, 'abortSignal'),
            {
              signal: props.abortSignal,
            },
          );

          for await (const chunkText of cloudResponse) {
            yield chunkText;
          }

          return null;
        }

        assert(googleAi, 'Google AI is not initialized');

        const response = sharedGenerateChatResponse({ ...props, googleAi });

        for await (const chunk of response) {
          yield chunk.text ?? null;
        }

        return null;
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
    [auth.user?.subscription, cloudApiStream, googleAi],
  );

  const generateInlineCompletions = useCallback(
    async (props: Omit<GenerateInlineCompletionsProps, 'googleAi'>) => {
      try {
        if (auth.user?.subscription) {
          return cloudApi.ai.generateInlineCompletions.mutate(omit(props, 'abortSignal'), {
            signal: props.abortSignal,
          });
        }

        assert(googleAi, 'Google AI is not initialized');

        const reponse = await sharedGenerateInlineCompletions({ ...props, googleAi });

        return reponse?.text ?? null;
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
    [auth.user?.subscription, cloudApi, googleAi],
  );

  const enabled = auth.user?.subscription || Boolean(googleAi);

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
