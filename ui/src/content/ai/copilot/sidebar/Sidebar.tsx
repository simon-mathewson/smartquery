import {
  ArrowForward,
  Close,
  DeleteOutline,
  Language,
  LightbulbOutline,
  Send,
} from '@mui/icons-material';
import { CircularProgress, LinearProgress } from '@mui/material';
import classNames from 'classnames';
import { useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalyticsContext } from '~/content/analytics/Context';
import { AuthContext } from '~/content/auth/Context';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import { copilotChatSuggestions } from '~/content/connections/demo/copilotChatSuggestions';
import { routes } from '~/router/routes';
import { ActionList } from '~/shared/components/actionList/ActionList';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { Tooltip } from '~/shared/components/tooltip/Tooltip';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { CopilotContext } from '../Context';
import { CodeSnippet } from './CodeSnippet/CodeSnippet';
import { CopilotSidebarContext } from './Context';

export const CopilotSidebar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);
  const { isOpen, setIsOpen } = useDefinedContext(CopilotSidebarContext);
  const {
    clearThread,
    input,
    isLoading,
    isLoadingSchemaDefinitions,
    hasSchemaDefinitions,
    sendMessage,
    setInput,
    stopGenerating,
    thread,
  } = useDefinedContext(CopilotContext);

  const isMobile = useIsMobile();

  const threadContainerRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(
    (inputToSend: string) => {
      void sendMessage(inputToSend);

      track('copilot_send_message');

      // Scroll user message into view, not response
      setTimeout(() => {
        if (!threadContainerRef.current) return;
        [...threadContainerRef.current.querySelectorAll('.user-message')].at(-1)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    },
    [sendMessage, track],
  );

  const [desktopWidth, setDesktopWidth] = useStoredState('CopilotSidebar.width', 328);

  if (!activeConnection) return null;

  return (
    <div
      className={classNames(
        'absolute right-0 z-50 h-screen bg-background p-3 sm:relative sm:right-0 sm:pl-1 sm:pt-[60px]',
        {
          'sm:!w-0 sm:!p-0': !isOpen,
          '!-right-full': !isOpen && isMobile,
        },
      )}
      style={{ width: isMobile ? '100%' : `${desktopWidth}px` }}
    >
      {!isMobile && isOpen && (
        <ResizeHandle
          offset={13}
          position="left"
          onResize={setDesktopWidth}
          minWidth={200}
          maxWidth={600}
        />
      )}
      <Card
        htmlProps={{
          className: classNames('max-h-full h-max flex-col flex gap-2', {
            '!right-3': isOpen && isMobile,
          }),
        }}
      >
        <Header
          left={
            thread.length ? (
              <Button
                htmlProps={{
                  onClick: () => {
                    clearThread();
                    track('copilot_clear_thread');
                    threadContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  },
                }}
                icon={<DeleteOutline />}
                tooltip="Clear thread"
              />
            ) : null
          }
          middle={<div className="text-center text-sm font-medium text-textPrimary">Copilot</div>}
          right={
            <Button
              color="secondary"
              htmlProps={{
                onClick: () => {
                  setIsOpen(false);
                  track('copilot_close');
                },
              }}
              icon={<Close />}
              tooltip="Close"
            />
          }
        />
        <div className="overflow-auto px-1" ref={threadContainerRef}>
          <div className="space-y-4">
            {thread.map((message, index) => {
              if (message.content.length === 0) return null;

              return (
                <div
                  className={classNames({ 'flex justify-end pl-[32px]': message.role === 'user' })}
                  key={index}
                >
                  <div
                    className={classNames(
                      'prose max-w-none space-y-3 overflow-hidden break-words text-sm leading-normal dark:prose-invert prose-code:font-[500] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 [&:has(.monaco-editor)]:w-full [&_strong]:font-[500]',
                      {
                        'user-message prose-invert rounded-xl bg-primary px-2 py-1.5 text-white':
                          message.role === 'user',
                      },
                    )}
                  >
                    {message.content.map((item, itemIndex) =>
                      typeof item === 'string' ? (
                        <ReactMarkdown
                          components={{
                            a: (props) => (
                              <a
                                {...props}
                                {...(!props.href?.startsWith('#')
                                  ? { target: '_blank', rel: 'noopener noreferrer' }
                                  : {})}
                              />
                            ),
                            code: CodeSnippet,
                          }}
                          key={itemIndex}
                          remarkPlugins={[remarkGfm]}
                        >
                          {item}
                        </ReactMarkdown>
                      ) : (
                        <CodeSnippet query={item} key={itemIndex}>
                          {item.sql}
                        </CodeSnippet>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {isLoading && (
            <LinearProgress className="mt-4 !h-1 rounded-full !bg-primaryHighlightHover [&_.MuiLinearProgress-bar]:!bg-primary" />
          )}
          {activeConnection.id === 'demo' && !isLoading && (
            <ActionList
              actions={copilotChatSuggestions
                .filter(
                  (suggestion) =>
                    !thread.some((message) =>
                      message.content.some(
                        (item) => typeof item === 'string' && item === suggestion,
                      ),
                    ),
                )
                .map((suggestion) => ({
                  disabled: user === null,
                  label: suggestion,
                  icon: LightbulbOutline,
                  onClick: () => {
                    submit(suggestion);
                  },
                }))}
              compact
              htmlProps={{ className: 'mt-4' }}
            />
          )}
          <div className="h-screen w-full" />
        </div>
        <div>
          {isLoadingSchemaDefinitions && (
            <div className="mb-2 mt-1 flex w-max items-center gap-2 rounded-lg bg-primaryHighlight px-2 py-1 text-xs font-[500] text-textSecondary">
              <CircularProgress size={15} className="!text-textSecondary" />
              <div className="text-xs text-textSecondary">Loading schema definitions...</div>
            </div>
          )}
          {hasSchemaDefinitions && activeConnection && (
            <Tooltip<HTMLDivElement> text="Schema definitions of this database are passed to Copilot as context. Rows are never passed.">
              {({ htmlProps }) => (
                <div
                  {...htmlProps}
                  className={classNames(
                    'mb-2 mt-1 flex w-max items-center gap-2 rounded-lg bg-primaryHighlight px-2 py-1 text-xs font-[500] text-textSecondary',
                    htmlProps.className,
                  )}
                >
                  <Language className="!h-4 !w-4" />
                  <span>
                    {activeConnection.database}
                    {activeConnection.engine === 'postgres' && ` ⁠– ${activeConnection.schema}`}
                  </span>
                </div>
              )}
            </Tooltip>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <Field>
              <Input
                element="textarea"
                htmlProps={{
                  disabled: isLoading || user === null,
                  placeholder: 'Ask anything about your database',
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();

                      if (e.shiftKey) {
                        const textarea = e.target as HTMLTextAreaElement;
                        const cursorPosition = textarea.selectionStart;
                        const newInput =
                          input.slice(0, cursorPosition) + '\n' + input.slice(cursorPosition);

                        setInput(newInput);

                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
                        }, 0);
                      } else if (input.length !== 0) {
                        void submit(input);
                      }
                    }
                  },
                  value: input,
                }}
                onChange={setInput}
              />
              {isLoading ? (
                <div className="relative h-fit w-fit">
                  <Button
                    htmlProps={{
                      onClick: () => {
                        stopGenerating();
                        track('copilot_stop_generating');
                      },
                    }}
                    icon={<Close />}
                    key="stop"
                    tooltip="Stop generating"
                  />
                  <CircularProgress
                    className="absolute left-[4px] top-[4px] !text-primary"
                    size={28}
                  />
                </div>
              ) : (
                <Button
                  htmlProps={{
                    disabled: input.length === 0,
                    type: 'submit',
                  }}
                  icon={<Send />}
                  key="send"
                  tooltip="Send"
                />
              )}
            </Field>
          </form>
          {user === null && (
            <Button
              element="link"
              htmlProps={{
                className: 'w-full mt-2',
                href: routes.subscribePlans(),
              }}
              icon={<ArrowForward />}
              label="Sign up to use Copilot for free"
              variant="filled"
            />
          )}
        </div>
      </Card>
    </div>
  );
};
