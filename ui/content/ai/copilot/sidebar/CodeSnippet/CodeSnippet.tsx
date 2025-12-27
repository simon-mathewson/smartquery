import type { SavedQuery } from '@/savedQueries/types';
import { ContentCopyOutlined, EditOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import type { ExtraProps } from 'react-markdown';
import { AnalyticsContext } from '~/content/analytics/Context';
import { NativeContext } from '~/content/native/Context';
import { isReactNative } from '~/content/native/useNative';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { ToastContext } from '~/content/toast/Context';
import type { ButtonProps } from '~/shared/components/button/Button';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import Play from '~/shared/icons/Play.svg?react';

export type CodeSnippetProps = {
  children?: React.ReactNode;
  className?: string;
  query?: Omit<SavedQuery, 'id'>;
  onCloseCopilot?: () => void;
} & ExtraProps;

export const CodeSnippet = React.memo((props: CodeSnippetProps) => {
  const { children, className, node, query, onCloseCopilot } = props;

  const native = useDefinedContext(NativeContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const toast = useDefinedContext(ToastContext);
  const { addQuery } = useDefinedContext(QueriesContext);

  const match = /language-(.+)/.exec(className || '');
  const language = query ? 'sql' : match?.[1];

  const code = String(children).trim();

  const showActions = language && ['sql', 'sqlite'].includes(language);

  const getSqlActions = useCallback(
    (code: string) =>
      [
        {
          htmlProps: {
            onClick: () => {
              track('copilot_run_query');

              void addQuery(
                {
                  ...(query ?? { sql: code }),
                },
                { afterActiveTab: true, alwaysRun: true },
              );

              onCloseCopilot?.();
            },
          },
          icon: <Play />,
          tooltip: 'Run',
        },
        {
          htmlProps: {
            onClick: () => {
              track('copilot_edit_query');

              void addQuery(
                {
                  initialInputMode: 'editor',
                  ...(query ?? { sql: code }),
                },
                { afterActiveTab: true },
              );

              onCloseCopilot?.();
            },
          },
          icon: <EditOutlined />,
          tooltip: 'Edit',
        },
        {
          htmlProps: {
            onClick: async () => {
              track('copilot_copy_query');

              if (isReactNative) {
                native.writeToClipboard(code);
              } else {
                await navigator.clipboard.writeText(code);
              }

              toast.add({
                title: 'Copied to clipboard',
                color: 'success',
              });
            },
          },
          icon: <ContentCopyOutlined />,
          tooltip: 'Copy',
        },
      ] satisfies ButtonProps[],
    [track, addQuery, query, onCloseCopilot, toast, native],
  );

  if (!language) {
    return (
      <code
        className={classNames(
          'inline-block whitespace-normal rounded-xl border border-border bg-background px-1 py-0 text-textSecondary',
          {
            '!p-2': node?.position?.start?.column === 1,
          },
        )}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <CodeEditor
        getActions={showActions ? () => getSqlActions(code) : undefined}
        editorOptions={{
          padding: {
            bottom: 12,
          },
        }}
        maxHeight={200}
        hideLineNumbers
        language={language}
        readOnly
        title={query?.name}
        value={code}
      />
    </div>
  );
});
