import superjson from '@/superjson/superjson';
import * as monaco from 'monaco-editor';
import { useCallback, useMemo, useRef } from 'react';
import type { SchemaDefinitions } from '~/content/ai/schemaDefinitions/types';
import { AnalyticsContext } from '~/content/analytics/Context';
import { CopilotContext } from '~/content/ai/copilot/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { generateInlineCompletions as generateInlineCompletionsOpenAi } from '~/content/ai/openai/client';
import type { CodeEditorProps } from '../CodeEditor';

export const useAiInlineCompletions = (props: {
  getSchemaDefinitions?: () => Promise<SchemaDefinitions | null>;
}) => {
  const { getSchemaDefinitions } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { openaiApiKey } = useDefinedContext(CopilotContext);

  const timeoutRef = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const generateInlineCompletions = useCallback(
    async (props: {
      codeBeforeCursor: string;
      codeAfterCursor: string;
      language: string | null;
      schemaDefinitions: string | null;
      abortSignal: AbortSignal;
    }) => {
      if (openaiApiKey.length === 0) return null;
      try {
        return generateInlineCompletionsOpenAi(openaiApiKey, {
          codeBeforeCursor: props.codeBeforeCursor,
          codeAfterCursor: props.codeAfterCursor,
          language: props.language,
          schemaDefinitions: props.schemaDefinitions,
          abortSignal: props.abortSignal,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.startsWith('exception AbortError:') ||
            error.message === 'BodyStreamBuffer was aborted' ||
            error.message.includes('signal is aborted'))
        ) {
          return null;
        }
        return null;
      }
    },
    [openaiApiKey],
  );

  const setUpAiInlineCompletions = useCallback(
    (props: { language: CodeEditorProps['language']; monacoLanguage: string }) => {
      const { language, monacoLanguage } = props;

      const disposable = monaco.languages.registerInlineCompletionsProvider(monacoLanguage, {
        handleItemDidShow: () => track('code_editor_ai_suggestion_show'),
        handlePartialAccept: () => track('code_editor_ai_suggestion_accept'),
        freeInlineCompletions: () => {},
        provideInlineCompletions: async (model, position, _, cancellationToken) => {
          const emptyResult: monaco.languages.InlineCompletions = {
            items: [],
          };

          const lines = model.getLinesContent();
          const codeBeforeCursor = [
            ...lines.slice(0, position.lineNumber - 1),
            lines[position.lineNumber - 1].substring(0, position.column),
          ].join('\n');
          const codeAfterCursor = [
            lines[position.lineNumber - 1].substring(position.column),
            ...lines.slice(position.lineNumber),
          ].join('\n');

          clearTimeout(timeoutRef.current);

          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(resolve, 500) as unknown as number;
          });

          abortControllerRef.current = new AbortController();

          cancellationToken.onCancellationRequested(() => {
            clearTimeout(timeoutRef.current);
            abortControllerRef.current?.abort();
          });

          const schemaDefinitions = getSchemaDefinitions ? await getSchemaDefinitions() : null;
          const schemaDefinitionsText = schemaDefinitions
            ? superjson.stringify(schemaDefinitions.definitions)
            : null;

          const response = await generateInlineCompletions({
            abortSignal: abortControllerRef.current.signal,
            codeBeforeCursor,
            codeAfterCursor,
            language: language ?? null,
            schemaDefinitions: schemaDefinitionsText,
          });

          const responseText = response ?? '';

          // Only filter out completely empty responses or just semicolons
          if (!responseText || responseText.trim() === '' || responseText.trim() === ';') {
            return emptyResult;
          }

          const codeToInsert =
            responseText
              // OpenAI may return escaped newline characters even when telling it not to. Therefore, we are
              // replacing them here.
              .replace(/\\n/g, '\n')
              // Remove unwanted markdown formatting
              .replace(/(^```sql[\s]*)|(\s*```)/g, '') || undefined;

          if (!codeToInsert) {
            return emptyResult;
          }

          const result = {
            enableForwardStability: true,
            items: [
              {
                insertText: codeToInsert,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column + codeToInsert.length,
                },
              },
            ],
          } satisfies monaco.languages.InlineCompletions;

          return result;
        },
      });

      return [disposable];
    },
    [generateInlineCompletions, getSchemaDefinitions, track],
  );

  return useMemo(() => ({ setUpAiInlineCompletions }), [setUpAiInlineCompletions]);
};
