import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { useCallback, useMemo, useRef, useState } from 'react';
import { cloneDeep, omit } from 'lodash';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import type { AiTextContent } from '@/ai/types';
import superjson from 'superjson';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { AuthContext } from '~/content/auth/Context';
import type { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '../../../../../cloud/router';

export const useCopilot = () => {
  const { cloudApiStream } = useDefinedContext(CloudApiContext);
  const { user } = useDefinedContext(AuthContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

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
      props: inferRouterInputs<AppRouter>['ai']['generateChatResponse'] & {
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

  const isEnabled = user !== null;

  return useMemo(
    () => ({
      clearThread,
      input,
      isEnabled,
      isLoading,
      isLoadingSchemaDefinitions,
      hasSchemaDefinitions,
      isOpen,
      sendMessage,
      setInput,
      setIsOpen,
      stopGenerating,
      thread,
    }),
    [
      clearThread,
      input,
      isEnabled,
      isLoading,
      isLoadingSchemaDefinitions,
      hasSchemaDefinitions,
      isOpen,
      sendMessage,
      setIsOpen,
      stopGenerating,
      thread,
    ],
  );
};
