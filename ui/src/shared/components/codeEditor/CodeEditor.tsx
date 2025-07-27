import * as monaco from 'monaco-editor';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AiContext } from '~/content/ai/Context';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ThemeContext } from '~/content/theme/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Loading } from '../loading/Loading';
import { AiSuggestionWidget } from './aiSuggestion/widget';
import { DataObject } from '@mui/icons-material';
import { includes, uniqBy } from 'lodash';
import { formatJson, isValidJson } from '~/shared/utils/json/json';
import type { Engine } from '@/types/connection';
import { sqliteKeywords } from './sqliteKeywords';
import type { ICompletionItem } from 'monaco-sql-languages';
import { EntityContextType, LanguageIdEnum, setupLanguageFeatures } from 'monaco-sql-languages';
import type { editor } from 'monaco-editor';

import 'monaco-sql-languages/esm/languages/mysql/mysql.contribution';
import 'monaco-sql-languages/esm/languages/pgsql/pgsql.contribution';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import PGSQLWorker from 'monaco-sql-languages/esm/languages/pgsql/pgsql.worker?worker';
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';
import { useSchemaDefinitions } from '~/content/ai/schemaDefinitions/useSchemaDefinitions';

self.MonacoEnvironment = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWorker(_: any, label: string) {
    if (label === LanguageIdEnum.PG) {
      return new PGSQLWorker();
    }
    if (label === LanguageIdEnum.MYSQL) {
      return new MySQLWorker();
    }
    return new EditorWorker();
  },
};

// Define custom themes to fix quote color issues
const defineCustomThemes = () => {
  // Light theme
  monaco.editor.defineTheme('vs-custom', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string', foreground: 'a31515' }, // Dark red for strings in light mode
      { token: 'string.sql', foreground: 'a31515' },
      { token: 'string.json', foreground: 'a31515' },
    ],
    colors: {},
  });

  // Dark theme
  monaco.editor.defineTheme('vs-dark-custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string', foreground: 'ce9178' }, // Light orange for strings in dark mode
      { token: 'string.sql', foreground: 'ce9178' },
      { token: 'string.json', foreground: 'ce9178' },
    ],
    colors: {},
  });
};

export type CodeEditorProps = {
  autoFocus?: boolean;
  editorOptions?: editor.IStandaloneEditorConstructionOptions | undefined;
  getActions?: (editor: editor.IStandaloneCodeEditor) => ButtonProps[];
  getAdditionalSystemInstructions?: () => Promise<string | null>;
  hideLineNumbers?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  language?: 'json' | 'sql' | Engine;
  large?: boolean;
  maxHeight?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  submit?: () => void;
  value?: string;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const {
    autoFocus,
    editorOptions,
    getActions,
    getAdditionalSystemInstructions,
    hideLineNumbers,
    htmlProps,
    language,
    large,
    maxHeight,
    onChange,
    readOnly,
    value,
  } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { mode } = useDefinedContext(ThemeContext);
  const ai = useDefinedContext(AiContext);

  const { getAndRefreshSchemaDefinitions } = useSchemaDefinitions();

  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const [actions, setActions] = useState<ButtonProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMonacoLanguage = useCallback(() => {
    switch (language) {
      case 'json':
        return 'json';
      case 'sqlite':
        return 'sql';
      case 'mysql':
        return LanguageIdEnum.MYSQL;
      case 'postgres':
        return LanguageIdEnum.PG;
      default:
        return 'sql';
    }
  }, [language]);

  const initialHeight = large ? 80 : 30;
  const fontSize = 12;
  const lineHeight = 18;
  const getPaddingTop = useCallback(
    (currentActions: ButtonProps[]) => {
      if (currentActions.length) return 36;
      return large ? 12 : 6;
    },
    [large],
  );
  const paddingBottom = large ? 12 : 6;

  const buildActions = useCallback(async () => {
    const actionList: ButtonProps[] = [];

    if (
      !readOnly &&
      editorRef.current &&
      includes(['sql', 'json', 'sqlite', 'mysql', 'postgres'], language) &&
      value
    ) {
      const jsonDisabled = language === 'json' && !isValidJson(value);

      const { format: formatSql } = await import('sql-formatter');

      actionList.push({
        htmlProps: {
          disabled: jsonDisabled,
          onClick: () => {
            if (!editorRef.current) return;

            switch (language) {
              case 'json':
                editorRef.current.setValue(formatJson(value));
                break;
              case 'mysql':
              case 'postgres':
              case 'sqlite':
              case 'sql':
                editorRef.current.setValue(formatSql(value));
                break;
              default:
                break;
            }
          },
        },
        icon: <DataObject />,
        tooltip: `Format${jsonDisabled ? ' (JSON invalid)' : ''}`,
      });
    }

    if (getActions && editorRef.current) {
      actionList.push(...getActions(editorRef.current));
    }

    setActions(actionList);

    if (editorRef.current) {
      editorRef.current.updateOptions({
        padding: {
          top: getPaddingTop(actionList),
        },
      });
    }
  }, [getActions, getPaddingTop, language, readOnly, value]);

  const getSuggestionsFromSchemaDefinitions = useCallback(async () => {
    const schemaDefinitions = await getAndRefreshSchemaDefinitions();

    const suggestions: {
      syntaxContextType: EntityContextType;
      completionItem: ICompletionItem;
    }[] = [];

    if (schemaDefinitions) {
      suggestions.push(
        ...schemaDefinitions.definitions.tables.map((table) => {
          const tableName = 'name' in table ? table.name : table.table_name;

          return {
            syntaxContextType: EntityContextType.TABLE,
            completionItem: {
              detail: 'Table',
              insertText: tableName,
              kind: monaco.languages.CompletionItemKind.Class,
              label: tableName,
              sortText: `1${tableName}`,
            } satisfies ICompletionItem,
          };
        }),
      );

      suggestions.push(
        ...schemaDefinitions.definitions.tables.flatMap((table) => {
          if (!('columns' in table)) return [];

          return table.columns.map((column) => {
            return {
              syntaxContextType: EntityContextType.COLUMN,
              completionItem: {
                detail: 'Column',
                insertText: column.column_name,
                kind: monaco.languages.CompletionItemKind.Field,
                label: column.column_name,
                sortText: `0${column.column_name}`,
              },
            };
          });
        }),
      );
    }

    return uniqBy(suggestions, 'completionItem.insertText');
  }, [getAndRefreshSchemaDefinitions]);

  // Initialize editor
  useEffect(() => {
    if (!hostRef.current || editorRef.current) return;

    // Define custom themes if not already defined
    defineCustomThemes();

    const options: editor.IStandaloneEditorConstructionOptions = {
      value: value || '',
      language: getMonacoLanguage(),
      theme: mode === 'light' ? 'vs-custom' : 'vs-dark-custom',
      folding: false,
      fontSize,
      glyphMargin: true,
      lineDecorationsWidth: hideLineNumbers ? 0 : 16,
      lineHeight,
      lineNumbers: hideLineNumbers ? 'off' : undefined,
      lineNumbersMinChars: 2,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      renderLineHighlight: readOnly ? 'none' : 'line',
      renderLineHighlightOnlyWhenFocus: true,
      padding: {
        top: getPaddingTop(actions),
        bottom: paddingBottom,
      },
      readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        vertical: 'hidden',
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      ...(editorOptions ?? {}),
    };

    editorRef.current = monaco.editor.create(hostRef.current, options);
    setIsLoading(false);

    const disposables: monaco.IDisposable[] = [];

    // Set up SQLite completion provider
    if (language === 'sqlite') {
      const sqliteCompletionProvider = monaco.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: async (_, position) => {
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          };

          const suggestions: ICompletionItem[] = sqliteKeywords.map((keyword) => ({
            detail: 'Keyword',
            insertText: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            label: keyword,
            range,
            sortText: `2${keyword}`,
          }));

          suggestions.push(
            ...(await getSuggestionsFromSchemaDefinitions()).map(
              (suggestion) => suggestion.completionItem,
            ),
          );

          return { suggestions: suggestions as monaco.languages.CompletionItem[] };
        },
      });

      disposables.push(sqliteCompletionProvider);
    } else if (includes<string>([LanguageIdEnum.MYSQL, LanguageIdEnum.PG], getMonacoLanguage())) {
      setupLanguageFeatures(getMonacoLanguage() as LanguageIdEnum, {
        completionItems: {
          completionService: async (_, __, ___, syntaxContext) => {
            if (!syntaxContext) {
              return Promise.resolve([]);
            }
            const { keywords, syntax } = syntaxContext;
            const keywordsCompletionItems: ICompletionItem[] = keywords.map((kw) => ({
              insertText: kw,
              detail: 'Keyword',
              kind: monaco.languages.CompletionItemKind.Keyword,
              label: kw,
              sortText: '2' + kw,
            }));

            const filteredSuggestions: ICompletionItem[] = [];

            const allSyntaxCompletionItems = await getSuggestionsFromSchemaDefinitions();
            syntax.forEach((item) => {
              filteredSuggestions.push(
                ...allSyntaxCompletionItems
                  .filter((suggestion) => suggestion.syntaxContextType === item.syntaxContextType)
                  .map((suggestion) => suggestion.completionItem),
              );
            });

            return [...filteredSuggestions, ...keywordsCompletionItems];
          },
        },
      });
    }

    editorRef.current.onDidChangeModelContent(() => {
      const currentValue = editorRef.current?.getValue() || '';
      onChange?.(currentValue);
    });

    const setHeight = () => {
      if (!editorRef.current) return;

      const contentHeight = Math.min(
        maxHeight ?? Infinity,
        Math.max(initialHeight, editorRef.current.getContentHeight()),
      );

      // Update the container height
      if (containerRef.current) {
        containerRef.current.style.height = `${contentHeight}px`;
      }

      // Update the host div height
      if (hostRef.current) {
        hostRef.current.style.height = `${contentHeight}px`;
      }

      editorRef.current.layout({
        width: editorRef.current.getContainerDomNode().clientWidth,
        height: contentHeight,
      });
    };

    editorRef.current.onDidContentSizeChange(setHeight);

    if (props.submit) {
      editorRef.current.onKeyDown((event) => {
        const isWindows = getIsWindows();
        const { browserEvent } = event;

        if (
          browserEvent.key === 'Enter' &&
          !browserEvent.shiftKey &&
          !browserEvent.altKey &&
          !browserEvent.repeat &&
          ((isWindows && browserEvent.ctrlKey && !browserEvent.metaKey) ||
            (!isWindows && !browserEvent.ctrlKey && browserEvent.metaKey))
        ) {
          browserEvent.stopPropagation();

          if (editorRef.current?.getValue()) {
            props.submit?.();
          }
        }
      });
    }

    setHeight();

    editorRef.current.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

    if (autoFocus) {
      editorRef.current.focus();
    }

    if (!readOnly) {
      new AiSuggestionWidget(
        editorRef.current,
        monaco,
        ai,
        track,
        hostRef,
        lineHeight,
        getPaddingTop(actions),
        fontSize,
        getAdditionalSystemInstructions,
        language,
      );
    }

    void buildActions();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = undefined;
      }

      disposables.forEach((disposable) => disposable.dispose());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model && model.getLanguageId() !== getMonacoLanguage()) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage());
    }
  }, [language, getMonacoLanguage]);

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(mode === 'light' ? 'vs-custom' : 'vs-dark-custom');
    }
  }, [mode]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  useEffect(() => {
    if (editorRef.current && editorOptions) {
      editorRef.current.updateOptions(editorOptions);
    }
  }, [editorOptions]);

  return (
    <>
      <div
        ref={containerRef}
        className={classNames(
          'pr-2 [&_.margin]:!bg-background [&_.monaco-editor-background]:!bg-background [&_.monaco-editor]:!bg-background [&_.monaco-editor]:!outline-none [&_.sticky-widget]:!bg-background [&_.suggest-widget>.message]:text-[12px]',
          htmlProps?.className,
          {
            '[&_.monaco-editor_.cursors-layer_>_.cursor]:!hidden': readOnly,
          },
        )}
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {isLoading && <Loading size={large ? 'default' : 'small'} />}
        {!isLoading && actions.length > 0 && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-end">
            <div
              className={classNames(
                'pointer-events-auto flex h-max justify-end gap-2 rounded-bl-[18px] bg-background pt-2',
                {
                  'pb-1 pl-1 pr-4': !large,
                  'p-2 pb-0 pr-2': large,
                },
              )}
            >
              {actions.map((action, index) => (
                <Button color="secondary" key={index} size="small" {...action} />
              ))}
            </div>
          </div>
        )}
        <div
          ref={hostRef}
          style={{
            height: '100%',
            width: '100%',
            maxHeight: `${maxHeight}px`,
            overflow: 'auto',
          }}
        />
      </div>
    </>
  );
};
