import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AiContext } from '../Context';
import { useCallback, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { cloneDeep } from 'lodash';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import type { AiTextContent } from '@/ai/types';
import superjson from 'superjson';

export const useCopilot = () => {
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const ai = useDefinedContext(AiContext);

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

  const sendMessage = useCallback(
    async (message: string) => {
      assert(ai.enabled);

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

        const response = await ai.generateChatResponse({
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
    [ai, thread, setThread, getAndRefreshSchemaDefinitions, activeConnection.engine],
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
      isEnabled: ai.enabled,
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
      ai.enabled,
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
