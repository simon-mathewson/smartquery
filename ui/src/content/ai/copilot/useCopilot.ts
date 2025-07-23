import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AiContext } from '../Context';
import type { Content } from '@google/genai';
import { useCallback, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { getSystemInstructions } from './systemInstruction';
import { ToastContext } from '../../toast/Context';
import { cloneDeep } from 'lodash';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';

export const useCopilot = () => {
  const toast = useDefinedContext(ToastContext);

  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const { googleAi } = useDefinedContext(AiContext);

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  const [thread, setThread] = useStoredState<Content[]>('useCopilot.thread', []);

  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const [input, setInput] = useState('');

  const {
    getSchemaDefinitionsInstruction,
    isLoading: isLoadingSchemaDefinitions,
    hasSchemaDefinitions,
  } = useSchemaDefinitions();

  const sendMessage = useCallback(
    async (message: string) => {
      assert(googleAi);

      setIsLoading(true);

      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const threadWithUserMessage = [
        ...thread,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ] satisfies Content[];

      setThread(threadWithUserMessage);

      try {
        const schemaDefinitionsInstruction = await getSchemaDefinitionsInstruction();

        const response = await googleAi.models.generateContentStream({
          model: 'gemini-2.0-flash',
          config: {
            abortSignal: abortControllerRef.current.signal,
            systemInstruction: getSystemInstructions(
              activeConnection,
              schemaDefinitionsInstruction,
            ),
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
        if (
          error instanceof Error &&
          (error.message.startsWith('exception AbortError:') ||
            error.message === 'BodyStreamBuffer was aborted')
        ) {
          return;
        }

        const getMessage = (error: unknown) => {
          if (error instanceof Error) {
            if (error.message.includes('The model is overloaded. Please try again later.')) {
              return 'The model is overloaded. Please try again later.';
            }

            return error.message;
          }
          return 'Unknown error';
        };

        toast.add({
          title: 'Error while generating response',
          description: getMessage(error),
          color: 'danger',
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeConnection, getSchemaDefinitionsInstruction, googleAi, setThread, thread, toast],
  );

  const stopGenerating = useCallback(() => {
    abortControllerRef.current.abort();
    setIsLoading(false);
  }, []);

  const clearThread = useCallback(() => {
    stopGenerating();
    setThread([]);
  }, [setThread, stopGenerating]);

  const isEnabled = googleAi !== null;

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
