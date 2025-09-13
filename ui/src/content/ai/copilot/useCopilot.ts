import type { AiTextContent } from '@/ai/types';
import type { inferRouterInputs } from '@trpc/server';
import { cloneDeep, omit } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import superjson from 'superjson';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { CloudRouter } from '../../../../../cloud/router';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';

export const useCopilot = () => {
  const { cloudApiStream } = useDefinedContext(CloudApiContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const [thread, setThread] = useStoredState<AiTextContent[]>('useCopilot.thread', []);

  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const [input, setInput] = useState('');

  const {
    getAndRefreshSchemaDefinitions,
    isLoading: isLoadingSchemaDefinitions,
    hasSchemaDefinitions,
  } = useSchemaDefinitions();

  const generateChatResponse = useCallback(
    async function* (
      props: inferRouterInputs<CloudRouter>['ai']['generateChatResponse'] & {
        abortSignal: AbortSignal;
      },
    ) {
      try {
        const cloudResponse = await cloudApiStream.ai.generateChatResponse.mutate(
          omit(props, 'abortSignal'),
          { signal: props.abortSignal },
        );

        for await (const chunkText of cloudResponse) {
          yield chunkText;
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
    [cloudApiStream],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      setIsLoading(true);

      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const threadWithUserMessage = [
        ...thread,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ] satisfies AiTextContent[];

      setThread(threadWithUserMessage);

      try {
        const schemaDefinitions = getAndRefreshSchemaDefinitions
          ? await getAndRefreshSchemaDefinitions()
          : null;
        const schemaDefinitionsText = schemaDefinitions
          ? superjson.stringify(schemaDefinitions.definitions)
          : null;

        const response = generateChatResponse({
          abortSignal: abortControllerRef.current.signal,
          contents: threadWithUserMessage,
          engine: activeConnection.engine,
          schemaDefinitions: schemaDefinitionsText,
        });

        if (!response) return;

        const responseContent = {
          role: 'model',
          parts: [{ text: '' }],
        } satisfies AiTextContent;

        setThread((contents) => [...contents, responseContent]);

        for await (const chunk of response) {
          responseContent.parts[0].text += chunk ?? '';

          setThread((contents) => [...contents.slice(0, -1), cloneDeep(responseContent)]);
        }

        setInput('');
      } finally {
        setIsLoading(false);
      }
    },
    [
      thread,
      setThread,
      getAndRefreshSchemaDefinitions,
      generateChatResponse,
      activeConnection.engine,
    ],
  );

  const stopGenerating = useCallback(() => {
    abortControllerRef.current.abort();
    setIsLoading(false);
  }, []);

  const clearThread = useCallback(() => {
    stopGenerating();
    setThread([]);
  }, [setThread, stopGenerating]);

  return useMemo(
    () => ({
      clearThread,
      input,
      isLoading,
      isLoadingSchemaDefinitions,
      hasSchemaDefinitions,
      sendMessage,
      setInput,
      stopGenerating,
      thread,
    }),
    [
      clearThread,
      input,
      isLoading,
      isLoadingSchemaDefinitions,
      hasSchemaDefinitions,
      sendMessage,
      stopGenerating,
      thread,
    ],
  );
};
