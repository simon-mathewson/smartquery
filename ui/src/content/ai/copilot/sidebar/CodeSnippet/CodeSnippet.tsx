import type { SavedQuery } from '@/savedQueries/types';
import { ContentCopyOutlined, EditOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import type { ExtraProps } from 'react-markdown';
import { AnalyticsContext } from '~/content/analytics/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { ToastContext } from '~/content/toast/Context';
import type { ButtonProps } from '~/shared/components/button/Button';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import Play from '~/shared/icons/Play.svg?react';
import { CopilotSidebarContext } from '../Context';

export type CodeSnippetProps = {
  children?: React.ReactNode;
  className?: string;
  query?: Omit<SavedQuery, 'id'>;
} & ExtraProps;

export const CodeSnippet = React.memo((props: CodeSnippetProps) => {
  const { children, className, node, query } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const toast = useDefinedContext(ToastContext);
  const { addQuery } = useDefinedContext(QueriesContext);
  const { setIsOpen } = useDefinedContext(CopilotSidebarContext);

  const isMobile = useIsMobile();

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
                  initialInputMode: 'editor',
                  ...(query ?? { sql: code }),
                },
                { afterActiveTab: true, alwaysRun: true },
              );

              if (isMobile) {
                setIsOpen(false);
              }
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

              if (isMobile) {
                setIsOpen(false);
              }
            },
          },
          icon: <EditOutlined />,
          tooltip: 'Edit',
        },
        {
          htmlProps: {
            onClick: () => {
              track('copilot_copy_query');

              void navigator.clipboard.writeText(code);
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
    [track, addQuery, query, isMobile, setIsOpen, toast],
  );

  if (!language) {
    return (
      <code
        className={classNames(
          'inline-block whitespace-normal rounded-lg border border-border bg-background px-1 py-0.5 text-textSecondary',
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
