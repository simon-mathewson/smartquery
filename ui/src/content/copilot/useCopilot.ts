import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { AiContext } from '../ai/Context';
import type { Content } from '@google/genai';
import { useCallback, useMemo, useRef, useState } from 'react';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '../connections/Context';
import { getCopilotSystemInstruction } from './systemInstruction';
import { ToastContext } from '../toast/Context';
import { cloneDeep, omit } from 'lodash';
import { TrpcContext } from '../trpc/Context';

export const useCopilot = () => {
  const toast = useDefinedContext(ToastContext);

  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const { googleAi } = useDefinedContext(AiContext);

  const [isOpen, setIsOpen] = useStoredState<boolean>('useCopilot.isOpen', false);

  const [thread, setThread] = useStoredState<Content[]>('useCopilot.thread', []);

  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(new AbortController());

  const [input, setInput] = useState('');

  const getSchemaDefinitions = useCallback(async () => {
    assert(activeConnection);
    assert('clientId' in activeConnection);

    const { engine, database, schema } = activeConnection;

    const results = await trpc.sendQuery.mutate({
      clientId: activeConnection.clientId,
      statements: [
        `
          SELECT table_name, table_type  FROM information_schema.tables 
          WHERE table_catalog = '${engine === 'postgresql' ? database : 'def'}'
          AND table_schema = '${engine === 'postgresql' ? schema : database}'
        `,
        `
          SELECT table_name, column_name, ordinal_position, column_default, is_nullable, data_type, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns
          WHERE table_catalog = '${engine === 'postgresql' ? database : 'def'}'
          AND table_schema = '${engine === 'postgresql' ? schema : database}'
        `,
        `
          SELECT constraint_name, table_name, constraint_type FROM information_schema.table_constraints
          WHERE table_catalog = '${engine === 'postgresql' ? database : 'def'}'
          AND table_schema = '${engine === 'postgresql' ? schema : database}'
          AND constraint_type <> 'CHECK'
        `,
        `
          SELECT table_name, view_definition FROM information_schema.views
          WHERE table_catalog = '${engine === 'postgresql' ? database : 'def'}'
          AND table_schema = '${engine === 'postgresql' ? schema : database}'
        `,
      ],
    });

    const [tables, columns, tableConstraints, views] = results;

    const processedTables = tables.map((table) => {
      return {
        ...table,
        columns: columns
          .filter((column) => column.table_name === table.table_name)
          .map((column) => omit(column, 'table_name')),
        tableConstraints: tableConstraints
          .filter((constraint) => constraint.table_name === table.table_name)
          .map((constraint) => omit(constraint, 'table_name')),
      };
    });

    return { tables: processedTables, views };
  }, [activeConnection, trpc]);

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
        const schemaDefinitions = await getSchemaDefinitions();

        const response = await googleAi.models.generateContentStream({
          model: 'gemini-2.0-flash',
          config: {
            abortSignal: abortControllerRef.current.signal,
            systemInstruction: getCopilotSystemInstruction(activeConnection, schemaDefinitions),
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
    [activeConnection, getSchemaDefinitions, googleAi, setThread, thread, toast],
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
