import { uniqBy } from 'lodash';
import * as monaco from 'monaco-editor';
import type { ICompletionItem, LanguageIdEnum } from 'monaco-sql-languages';
import { EntityContextType, setupLanguageFeatures } from 'monaco-sql-languages';
import { useCallback, useMemo } from 'react';
import { useSchemaDefinitions } from '~/content/ai/schemaDefinitions/useSchemaDefinitions';
import type { CodeEditorProps } from '../CodeEditor';
import { sqliteKeywords } from './sqliteKeywords';

type Item = {
  syntaxContextType: EntityContextType;
  completionItem: ICompletionItem;
};

export const useAutocomplete = () => {
  const { getAndRefreshSchemaDefinitions } = useSchemaDefinitions();

  const getSuggestionsFromSchemaDefinitions = useCallback(async () => {
    const schemaDefinitions = await getAndRefreshSchemaDefinitions();

    if (!schemaDefinitions) return [];

    const tableItems: Item[] = schemaDefinitions.definitions.tables.map((table) => {
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
    });

    const columnItems: Item[] = schemaDefinitions.definitions.tables.flatMap((table) => {
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
    });

    return uniqBy([...tableItems, ...columnItems], 'completionItem.insertText');
  }, [getAndRefreshSchemaDefinitions]);

  const setUpSqliteAutocomplete = useCallback(
    () =>
      monaco.languages.registerCompletionItemProvider('sql', {
        triggerCharacters: [],
        provideCompletionItems: async () => {
          const suggestions: ICompletionItem[] = sqliteKeywords.map((keyword) => ({
            detail: 'Keyword',
            insertText: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            label: keyword,
            sortText: `2${keyword}`,
          }));

          suggestions.push(
            ...(await getSuggestionsFromSchemaDefinitions()).map(
              (suggestion) => suggestion.completionItem,
            ),
          );

          return { suggestions: suggestions as monaco.languages.CompletionItem[] };
        },
      }),
    [getSuggestionsFromSchemaDefinitions],
  );

  const setUpMysqlPostgresAutocomplete = useCallback(
    (monacoLanguage: string) => {
      setupLanguageFeatures(monacoLanguage as LanguageIdEnum, {
        diagnostics: false,
        completionItems: {
          triggerCharacters: [],
          completionService: async (_, __, ___, syntaxContext) => {
            if (!syntaxContext) {
              return Promise.resolve([]);
            }

            const { keywords, syntax } = syntaxContext;

            const keywordItems: ICompletionItem[] = keywords.map((keyword) => ({
              insertText: keyword,
              detail: 'Keyword',
              kind: monaco.languages.CompletionItemKind.Keyword,
              label: keyword,
              sortText: `2${keyword}`,
            }));

            const syntaxItems: ICompletionItem[] = [];

            const allSyntaxItems = await getSuggestionsFromSchemaDefinitions();
            syntax.forEach((item) => {
              syntaxItems.push(
                ...allSyntaxItems
                  .filter((suggestion) => suggestion.syntaxContextType === item.syntaxContextType)
                  .map((suggestion) => suggestion.completionItem),
              );
            });

            return uniqBy([...syntaxItems, ...keywordItems], 'insertText');
          },
        },
      });
    },
    [getSuggestionsFromSchemaDefinitions],
  );

  const setUpAutocomplete = useCallback(
    (props: { language: CodeEditorProps['language']; monacoLanguage: string }) => {
      const { language, monacoLanguage } = props;

      const disposables: monaco.IDisposable[] = [];

      switch (language) {
        case 'sqlite': {
          const sqliteCompletionProvider = setUpSqliteAutocomplete();
          disposables.push(sqliteCompletionProvider);
          break;
        }
        case 'mysql':
        case 'postgres':
          setUpMysqlPostgresAutocomplete(monacoLanguage);
          break;
        default:
          break;
      }

      return disposables;
    },
    [setUpMysqlPostgresAutocomplete, setUpSqliteAutocomplete],
  );

  return useMemo(() => ({ setUpAutocomplete }), [setUpAutocomplete]);
};
