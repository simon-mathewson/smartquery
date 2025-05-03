import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AiContext } from '../ai/Context';
import type { Content } from '@google/genai';
import { useCallback, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '../connections/Context';
import { getCopilotSystemInstruction } from './systemInstruction';
import { ToastContext } from '../toast/Context';
import { cloneDeep } from 'lodash';

export const useCopilot = () => {
  const toast = useDefinedContext(ToastContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { googleAi } = useDefinedContext(AiContext);

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  const [thread, setThread] = useStoredState<Content[]>('useCopilot.thread', []);

  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const [input, setInput] = useState('');

  const sendMessage = useCallback(
    async (message: string) => {
      assert(googleAi);
      assert(activeConnection);

      setIsLoading(true);

      abortControllerRef.current.abort();

      const threadWithUserMessage = [
        ...thread,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ] satisfies Content[];

      setThread(threadWithUserMessage);

      try {
        const response = await googleAi.models.generateContentStream({
          model: 'gemini-2.0-flash',
          config: {
            abortSignal: abortControllerRef.current.signal,
            systemInstruction: getCopilotSystemInstruction(activeConnection),
          },
          contents: threadWithUserMessage,
        });

        const responseContent = {
          role: 'model',
          parts: [{ text: '' }],
        } satisfies Content;

        setThread((contents) => [...contents, responseContent]);

        for await (const chunk of response) {
          responseContent!.parts[0]!.text! += chunk.text;

          setThread((contents) => [...contents.slice(0, -1), cloneDeep(responseContent)]);
        }

        setInput('');
      } catch (error) {
        toast.add({
          title: 'Error while generating response',
          description: error instanceof Error ? error.message : 'Unknown error',
          color: 'danger',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [activeConnection, googleAi, setThread, thread, toast],
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
      isLoading,
      isOpen,
      sendMessage,
      setInput,
      setIsOpen,
      stopGenerating,
      thread,
    ],
  );
};
