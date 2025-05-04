import type { Part } from '@google/genai';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import { CodeActions } from './CodeActions/CodeActions';

export const MessagePart: React.FC<{ part: Part }> = ({ part }) => {
  return useMemo(
    () => (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;

            const match = /language-(json|sql)/.exec(className || '');

            const code = String(children).trim();

            const showActions = match?.[1] === 'sql';

            return match ? (
              <div className="overflow-hidden rounded-xl border border-border bg-background">
                {showActions && <CodeActions code={code} />}
                <CodeEditor
                  editorOptions={{
                    padding: {
                      top: showActions ? 0 : 12,
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
    ),
    [part.text],
  );
};
