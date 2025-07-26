import type { Part } from '@google/genai';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '~/content/analytics/Context';
import { QueriesContext } from '~/content/tabs/queries/Context';
import Play from '~/shared/icons/Play.svg?react';
import Add from '~/shared/icons/Add.svg?react';
import type { ButtonProps } from '~/shared/components/button/Button';
import { ContentCopyOutlined } from '@mui/icons-material';
import { ToastContext } from '~/content/toast/Context';

export const MessagePart: React.FC<{ part: Part }> = ({ part }) => {
  const { track } = useDefinedContext(AnalyticsContext);
  const toast = useDefinedContext(ToastContext);
  const { addQuery } = useDefinedContext(QueriesContext);

  const getSqlActions = (code: string) =>
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
              { afterActiveTab: true, run: true },
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
    ] satisfies ButtonProps[];

  return useMemo(() => {
    return (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;

            const match = /language-(json|sql)/.exec(className || '');

            const code = String(children).trim();

            const showActions = match?.[1] === 'sql';

            return match ? (
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                <CodeEditor
                  getActions={showActions ? () => getSqlActions(code) : undefined}
                  editorOptions={{
                    padding: {
                      bottom: 12,
                    },
                  }}
                  hideLineNumbers
                  language={match[1] as 'json' | 'sql'}
                  readOnly
                  value={code}
                />
              </div>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
        remarkPlugins={[remarkGfm]}
      >
        {part.text}
      </ReactMarkdown>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part.text]);
};
