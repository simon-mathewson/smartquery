import type { AiTextContent } from '@/ai/types';
import { cloneDeep } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import superjson from 'superjson';
import { assert } from 'ts-essentials';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { QueryResult } from '~/shared/types';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { generateChatResponse as generateChatResponseOpenAi } from '../openai/client';
import { OPENAI_API_KEY_STORAGE_KEY } from '../openai/storageKey';
import { parseResponse } from './parseResponse';
import type { ThreadMessage } from './types';
import { AnalyticsContext } from '~/content/analytics/Context';
import { CopilotSidebarContext } from './sidebar/Context';
import { MobileNavigationContext } from '~/content/navigation/mobile/Context';

const getStorageKey = (
  activeConnection: { id: string; engine: string; database: string; schema?: string } | undefined,
  suffix: string,
) => {
  if (!activeConnection) return null;

  const { id, engine, database, schema } = activeConnection;
  return `useCopilot.${suffix}.${id}.${database}${engine === 'postgres' ? `.${schema}` : ''}`;
};

export const useCopilot = () => {
  const [openaiApiKey, setOpenaiApiKey] = useStoredState<string>(OPENAI_API_KEY_STORAGE_KEY, '');
  const { track } = useDefinedContext(AnalyticsContext);
  const activeConnectionContext = useContext(ActiveConnectionContext);
  const { activeConnection } = activeConnectionContext ?? {};
  const { setIsOpen } = useDefinedContext(CopilotSidebarContext);
  const { setOverlayPage } = useDefinedContext(MobileNavigationContext);
  const hasApiKey = openaiApiKey.length > 0;

  const threadStorageKey = useMemo(
    () => getStorageKey(activeConnection, 'thread'),
    [activeConnection],
  );
  const queryResultsStorageKey = useMemo(
    () => getStorageKey(activeConnection, 'queryResults'),
    [activeConnection],
  );

  const [rawThread, setRawThread] = useStoredState<AiTextContent[]>(
    threadStorageKey,
    [],
    undefined,
    [
      (maybeGoogleAiThread) => {
        const updatedThread = cloneDeep(maybeGoogleAiThread);
        updatedThread.forEach((item) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((item as any).role === 'model') {
            item.role = 'assistant';
          }
          if ('parts' in item) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item.content = (item as any).parts.map((part: any) => part.text).join('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (item as any).parts;
          }
        });
        return updatedThread;
      },
    ],
  );
  const [thread, setThread] = useState<Awaited<ReturnType<typeof processThread>>>([]);
  const [queryResults, setQueryResults] = useStoredState<Record<string, QueryResult | null>>(
    queryResultsStorageKey,
    {},
  );

  const processThread = useCallback(
    (rawThread: AiTextContent[], queryResults: Record<string, QueryResult | null>) => {
      assert(activeConnection);

      return Promise.all(
        rawThread.map(async (item, messageIndex) =>
          item.role === 'user'
            ? ({
                content: [item.content] satisfies ThreadMessage[],
                role: 'user',
              } as const)
            : ({
                content: await Promise.all(
                  parseResponse(item.content).map(async (message, contentIndex) => {
                    const key = `${messageIndex}-${contentIndex}`;
                    const result = queryResults[key];
                    return typeof message === 'string'
                      ? message
                      : { ...message, ...(result != null && { result }) };
                  }),
                ),
                role: 'assistant',
              } as const),
        ),
      );
    },
    [activeConnection],
  );

  useEffect(() => {
    if (activeConnection) {
      void processThread(rawThread, queryResults).then(setThread);
    }
  }, [activeConnection, processThread, rawThread, queryResults]);

  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const [input, setInput] = useState('');

  const {
    getAndRefreshSchemaDefinitions,
    isLoading: isLoadingSchemaDefinitions,
    hasSchemaDefinitions,
  } = useSchemaDefinitions();

  const generateChatResponse = useCallback(
    async function* (props: {
      contents: AiTextContent[];
      engine: string;
      schemaDefinitions: string | null;
      abortSignal: AbortSignal;
    }) {
      if (!hasApiKey) return null;
      try {
        const stream = generateChatResponseOpenAi(openaiApiKey, {
          contents: props.contents,
          engine: props.engine,
          schemaDefinitions: props.schemaDefinitions,
          abortSignal: props.abortSignal,
        });
        for await (const chunk of stream) {
          yield chunk;
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
    [hasApiKey, openaiApiKey],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      assert(activeConnection);

      track('copilot_send_message');

      setIsOpen(true);
      setOverlayPage('copilot');

      setIsLoading(true);

      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const threadWithUserMessage = [
        ...rawThread,
        {
          role: 'user',
          content: message,
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
          role: 'assistant',
          content: '',
        } satisfies AiTextContent;

        setRawThread((contents) => [...contents, responseContent]);

        for await (const chunk of response) {
          responseContent.content += chunk ?? '';

          setRawThread((contents) => [...contents.slice(0, -1), cloneDeep(responseContent)]);
        }

        setInput('');
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeConnection,
      track,
      setIsOpen,
      setOverlayPage,
      rawThread,
      setRawThread,
      getAndRefreshSchemaDefinitions,
      generateChatResponse,
    ],
  );

  const stopGenerating = useCallback(() => {
    abortControllerRef.current.abort();
    setIsLoading(false);
  }, []);

  const clearThread = useCallback(() => {
    stopGenerating();
    setRawThread([]);
    setQueryResults({});
  }, [setRawThread, stopGenerating, setQueryResults]);

  const setQueryResult = useCallback(
    (messageIndex: number, contentIndex: number, result: QueryResult | null) => {
      const key = `${messageIndex}-${contentIndex}`;
      setQueryResults((currentQueryResults) => ({
        ...currentQueryResults,
        [key]: result,
      }));
    },
    [setQueryResults],
  );

  return useMemo(
    () => ({
      clearThread,
      hasApiKey,
      hasSchemaDefinitions,
      input,
      isLoading,
      isLoadingSchemaDefinitions,
      openaiApiKey,
      sendMessage,
      setInput,
      setOpenaiApiKey,
      setQueryResult,
      stopGenerating,
      thread,
    }),
    [
      clearThread,
      hasApiKey,
      hasSchemaDefinitions,
      input,
      isLoading,
      isLoadingSchemaDefinitions,
      openaiApiKey,
      sendMessage,
      setOpenaiApiKey,
      setQueryResult,
      stopGenerating,
      thread,
    ],
  );
};
