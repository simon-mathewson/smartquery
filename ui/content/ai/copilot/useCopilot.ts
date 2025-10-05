import type { AiTextContent } from '@/ai/types';
import type { inferRouterInputs } from '@trpc/server';
import { cloneDeep, omit } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import superjson from 'superjson';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { CloudRouter } from '../../../../cloud/router';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { parseResponse } from './parseResponse';
import type { ThreadMessage } from './types';
import { formatSql } from '~/shared/utils/sql/sql';
import { isQuotaExceededError } from './isQuotaExceededError';

export const useCopilot = () => {
  const { cloudApiStream } = useDefinedContext(CloudApiContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const [rawThread, setRawThread] = useStoredState<AiTextContent[]>('useCopilot.thread', []);
  const [thread, setThread] = useState<Awaited<ReturnType<typeof processThread>>>([]);

  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  const processThread = useCallback(
    (rawThread: AiTextContent[]) =>
      Promise.all(
        rawThread.map(async (item) =>
          item.role === 'user'
            ? ({
                content: [item.parts[0].text] satisfies ThreadMessage[],
                role: 'user',
              } as const)
            : ({
                content: await Promise.all(
                  parseResponse(item.parts[0].text).map(async (message) =>
                    typeof message === 'string'
                      ? message
                      : { ...message, sql: await formatSql(message.sql, activeConnection.engine) },
                  ),
                ),
                role: 'model',
              } as const),
        ),
      ),
    [activeConnection.engine],
  );

  useEffect(() => {
    void processThread(rawThread).then(setThread);
  }, [processThread, rawThread]);

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
        const chatResponse = await cloudApiStream.ai.generateChatResponse.mutate(
          omit(props, 'abortSignal'),
          { signal: props.abortSignal },
        );

        for await (const item of chatResponse) {
          yield item;
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

        if (isQuotaExceededError(error)) {
          setIsQuotaExceeded(true);
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
        ...rawThread,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ] satisfies AiTextContent[];

      setRawThread(threadWithUserMessage);

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

        setRawThread((contents) => [...contents, responseContent]);

        for await (const chunk of response) {
          responseContent.parts[0].text += chunk ?? '';

          setRawThread((contents) => [...contents.slice(0, -1), cloneDeep(responseContent)]);
        }

        setInput('');
      } finally {
        setIsLoading(false);
      }
    },
    [
      rawThread,
      setRawThread,
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
    setRawThread([]);
  }, [setRawThread, stopGenerating]);

  return useMemo(
    () => ({
      clearThread,
      input,
      isLoading,
      isLoadingSchemaDefinitions,
      hasSchemaDefinitions,
      isQuotaExceeded,
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
      isQuotaExceeded,
      hasSchemaDefinitions,
      sendMessage,
      stopGenerating,
      thread,
    ],
  );
};
