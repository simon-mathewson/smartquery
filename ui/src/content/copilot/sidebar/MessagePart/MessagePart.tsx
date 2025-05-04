import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';
import ReactMarkdown from 'react-markdown';
import type { Part } from '@google/genai';
import { useMemo } from 'react';
import remarkGfm from 'remark-gfm';

export const MessagePart: React.FC<{ part: Part }> = ({ part }) => {
  return useMemo(
    () => (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;

            const match = /language-(json|sql)/.exec(className || '');

            return match ? (
              <CodeEditor
                hideLineNumbers
                htmlProps={{
                  className: 'rounded-xl overflow-hidden',
                }}
                language={match[1] as 'json' | 'sql'}
                readOnly
                value={String(children).trim()}
              />
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
