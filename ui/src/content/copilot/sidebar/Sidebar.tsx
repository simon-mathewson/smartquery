import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../Context';
import { Card } from '~/shared/components/card/Card';
import { Input } from '~/shared/components/input/Input';
import { Field } from '~/shared/components/field/Field';
import { Button } from '~/shared/components/button/Button';
import { Close, Send, DeleteOutline, Stop, Language } from '@mui/icons-material';
import { Header } from '~/shared/components/header/Header';
import { PulseLoader } from 'react-spinners';
import colors from 'tailwindcss/colors';
import classNames from 'classnames';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { MessagePart } from './MessagePart/MessagePart';
import { CircularProgress } from '@mui/material';
import { ConnectionsContext } from '~/content/connections/Context';
import { assert } from 'ts-essentials';
import { AnalyticsContext } from '~/content/analytics/Context';

export const CopilotSidebar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  assert(activeConnection, 'No active connection');

  const {
    clearThread,
    input,
    isLoading,
    isLoadingSchemaDefinitions,
    hasSchemaDefinitions,
    sendMessage,
    setInput,
    setIsOpen,
    stopGenerating,
    thread,
  } = useDefinedContext(CopilotContext);

  return (
    <Card
      htmlProps={{ className: 'max-h-full h-max w-[320px] flex-none relative flex-col flex gap-2' }}
    >
      <Header
        left={
          thread.length ? (
            <Button
              htmlProps={{
                onClick: () => {
                  clearThread();
                  track('copilot_clear_thread');
                },
              }}
              icon={<DeleteOutline />}
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
          />
        }
      />
      <div className="flex flex-col gap-4 overflow-auto px-1">
        {thread.map((message, index) => {
          const textParts = message.parts?.map((part) => part.text).filter(isNotUndefined);

          if (!textParts?.length) {
            return null;
          }

          return (
            <div
              className={classNames({ 'flex justify-end pl-[32px]': message.role === 'user' })}
              key={index}
            >
              <div
                className={classNames(
                  'prose max-w-none text-sm leading-normal dark:prose-invert prose-code:font-[500] prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 [&:has(.monaco-editor)]:w-full [&_strong]:font-[500]',
                  {
                    'rounded-xl bg-primary px-2 py-1 text-white': message.role === 'user',
                  },
                )}
              >
                {message.parts?.map((part, partIndex) => (
                  <MessagePart key={partIndex} part={part} />
                ))}
              </div>
            </div>
          );
        })}
        {isLoading && <PulseLoader color={colors.neutral[400]} size={8} />}
      </div>
      <div>
        {isLoadingSchemaDefinitions && (
          <div className="mb-2 mt-1 flex w-max items-center gap-2 rounded-lg bg-primaryHighlight px-2 py-1 text-xs font-[500] text-textSecondary">
            <CircularProgress size={15} className="!text-textSecondary" />
            <div className="text-xs text-textSecondary">Loading schema definitions...</div>
          </div>
        )}
        {hasSchemaDefinitions && (
          <div className="mb-2 mt-1 flex w-max items-center gap-2 rounded-lg bg-primaryHighlight px-2 py-1 text-xs font-[500] text-textSecondary">
            <Language className="!h-4 !w-4" />
            <span className="font-mono">
              {activeConnection.database}
              {activeConnection.engine === 'postgres' && ` • ${activeConnection.schema}`}
            </span>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);

            track('copilot_send_message');
          }}
        >
          <Field>
            <Input
              element="textarea"
              htmlProps={{
                disabled: isLoading,
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
                      void sendMessage(input);
                    }
                  }
                },
                value: input,
              }}
              onChange={setInput}
            />
            {isLoading ? (
              <Button
                htmlProps={{
                  onClick: () => {
                    stopGenerating();
                    track('copilot_stop_generating');
                  },
                }}
                icon={<Stop />}
              />
            ) : (
              <Button
                htmlProps={{
                  disabled: input.length === 0,
                  onClick: () => {
                    track('copilot_send_message');
                  },
                  type: 'submit',
                }}
                icon={<Send />}
              />
            )}
          </Field>
        </form>
      </div>
    </Card>
  );
};
