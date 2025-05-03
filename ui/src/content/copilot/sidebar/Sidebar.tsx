import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../Context';
import { Card } from '~/shared/components/card/Card';
import { Input } from '~/shared/components/input/Input';
import { Field } from '~/shared/components/field/Field';
import { Button } from '~/shared/components/button/Button';
import { Close, Send, DeleteOutline, Stop } from '@mui/icons-material';
import { Header } from '~/shared/components/header/Header';
import { PulseLoader } from 'react-spinners';
import colors from 'tailwindcss/colors';
import classNames from 'classnames';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { MessagePart } from './MessagePart/MessagePart';

export const CopilotSidebar: React.FC = () => {
  const {
    clearThread,
    input,
    isLoading,
    sendMessage,
    setInput,
    setIsOpen,
    stopGenerating,
    thread,
  } = useDefinedContext(CopilotContext);

  return (
    <Card htmlProps={{ className: 'h-full w-[320px] flex-none relative flex-col flex gap-2' }}>
      <Header
        left={<Button htmlProps={{ onClick: () => clearThread() }} icon={<DeleteOutline />} />}
        middle={<div className="text-center text-sm font-medium text-textPrimary">Copilot</div>}
        right={
          <Button
            color="secondary"
            htmlProps={{ onClick: () => setIsOpen(false) }}
            icon={<Close />}
          />
        }
      />
      <div className="flex flex-1 flex-col gap-2 overflow-auto px-1">
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
                  'prose max-w-none text-sm leading-relaxed [&:has(.monaco-editor)]:w-full [&_strong]:font-[500]',
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
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
            <Button htmlProps={{ onClick: stopGenerating }} icon={<Stop />} />
          ) : (
            <Button htmlProps={{ disabled: input.length === 0, type: 'submit' }} icon={<Send />} />
          )}
        </Field>
      </form>
    </Card>
  );
};
