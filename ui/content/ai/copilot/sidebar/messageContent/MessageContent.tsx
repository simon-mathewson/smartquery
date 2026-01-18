import type { SavedQuery } from '@/savedQueries/types';
import { memo, useMemo } from 'react';
import { CodeSnippet } from './codeSnippet/CodeSnippet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageContentItemProps = {
  item: string | Omit<SavedQuery, 'id'>;
  itemIndex: number;
  messageIndex: number;
  onCloseCopilot?: () => void;
};

export const MessageContentItem = memo<MessageContentItemProps>(
  ({ item, itemIndex, messageIndex, onCloseCopilot }) => {
    const markdownComponents = useMemo(
      () => ({
        a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a
            {...props}
            {...(!props.href?.startsWith('#')
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          />
        ),
        code: (props: React.ComponentPropsWithoutRef<'code'>) => (
          <CodeSnippet
            {...props}
            onCloseCopilot={onCloseCopilot}
            messageIndex={messageIndex}
            contentIndex={itemIndex}
          />
        ),
      }),
      [messageIndex, itemIndex, onCloseCopilot],
    );

    if (typeof item === 'string') {
      return (
        <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
          {item}
        </ReactMarkdown>
      );
    }

    return (
      <CodeSnippet
        query={item}
        onCloseCopilot={onCloseCopilot}
        messageIndex={messageIndex}
        contentIndex={itemIndex}
      >
        {item.sql}
      </CodeSnippet>
    );
  },
);
