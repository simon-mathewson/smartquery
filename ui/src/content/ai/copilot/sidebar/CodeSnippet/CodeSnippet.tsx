import { ContentCopyOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import type { ExtraProps } from 'react-markdown';
import { AnalyticsContext } from '~/content/analytics/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import { ToastContext } from '~/content/toast/Context';
import type { ButtonProps } from '~/shared/components/button/Button';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import Add from '~/shared/icons/Add.svg?react';
import Play from '~/shared/icons/Play.svg?react';

export const CodeSnippet = React.memo(
  (props: { children?: React.ReactNode; className?: string } & ExtraProps) => {
    const { children, className, node } = props;

    const { track } = useDefinedContext(AnalyticsContext);
    const toast = useDefinedContext(ToastContext);
    const { addQuery } = useDefinedContext(QueriesContext);

    const match = /language-(.+)/.exec(className || '');
    const language = match?.[1];

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
                    sql: code,
                  },
                  { afterActiveTab: true, alwaysRun: true },
                );
              },
            },
            icon: <Play />,
            tooltip: 'Run',
          },
          {
            htmlProps: {
              onClick: () => {
                track('copilot_add_query');

                void addQuery(
                  {
                    initialInputMode: 'editor',
                    sql: code,
                  },
                  { afterActiveTab: true },
                );
              },
            },
            icon: <Add />,
            tooltip: 'Add tab',
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
      [addQuery, track, toast],
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
          value={code}
        />
      </div>
    );
  },
);
