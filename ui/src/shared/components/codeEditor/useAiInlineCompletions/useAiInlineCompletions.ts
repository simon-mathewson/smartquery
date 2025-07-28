import * as monaco from 'monaco-editor';
import { useCallback, useMemo, useRef } from 'react';
import { AiContext } from '~/content/ai/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { CodeEditorProps } from '../CodeEditor';
import { getSystemInstructions } from './getSystemInstructions';
import { AnalyticsContext } from '~/content/analytics/Context';

export const useAiInlineCompletions = (props: {
  getAdditionalSystemInstructions?: () => Promise<string | null>;
}) => {
  const { getAdditionalSystemInstructions } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const ai = useDefinedContext(AiContext);

  const timeoutRef = useRef<number | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

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

          if (!ai.enabled) {
            return emptyResult;
          }

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

          const additionalSystemInstructions = getAdditionalSystemInstructions
            ? await getAdditionalSystemInstructions()
            : null;

          try {
            const stream = await ai.generateContent({
              abortSignal: abortControllerRef.current.signal,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${codeBeforeCursor}<CURSOR>${codeAfterCursor}` }],
                },
              ],
              systemInstructions: getSystemInstructions(additionalSystemInstructions, language),
              temperature: 0,
            });

            let responseText = '';

            for await (const chunk of stream) {
              responseText += chunk ?? '';
            }

            // Only filter out completely empty responses or just semicolons
            if (!responseText || responseText.trim() === '' || responseText.trim() === ';') {
              return emptyResult;
            }

            const codeToInsert =
              responseText
                // Gemini will return escaped newline characters even when telling it not to. Therefore, we are
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
          } catch (error) {
            if (
              error instanceof Error &&
              (error.message.startsWith('exception AbortError:') ||
                error.message === 'BodyStreamBuffer was aborted' ||
                error.message.includes('signal is aborted'))
            ) {
              return emptyResult;
            }

            throw error;
          }
        },
      });

      return [disposable];
    },
    [ai, getAdditionalSystemInstructions, track],
  );

  return useMemo(() => ({ setUpAiInlineCompletions }), [setUpAiInlineCompletions]);
};
