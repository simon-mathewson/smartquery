import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AiContext } from '../Context';
import { useCallback, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { getSystemInstructions } from './systemInstruction';
import { ToastContext } from '../../toast/Context';
import { cloneDeep } from 'lodash';
import { useSchemaDefinitions } from '../schemaDefinitions/useSchemaDefinitions';
import { ActiveConnectionContext } from '../../connections/activeConnection/Context';
import type { AiTextContent } from '@/ai/types';

export const useCopilot = () => {
  const toast = useDefinedContext(ToastContext);

  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const ai = useDefinedContext(AiContext);

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  const [thread, setThread] = useStoredState<AiTextContent[]>('useCopilot.thread', []);

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
        const schemaDefinitionsInstruction = await getSchemaDefinitionsInstruction();

        const response = await ai.generateContent({
          abortSignal: abortControllerRef.current.signal,
          contents: threadWithUserMessage,
          systemInstructions: getSystemInstructions(activeConnection, schemaDefinitionsInstruction),
        });

        const responseContent = {
          role: 'model',
          parts: [{ text: '' }],
        } satisfies AiTextContent;

        setThread((contents) => [...contents, responseContent]);

        for await (const chunk of response) {
          responseContent!.parts[0]!.text! += chunk ?? '';

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
    [ai, activeConnection, getSchemaDefinitionsInstruction, setThread, thread, toast],
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
