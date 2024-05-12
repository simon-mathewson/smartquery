import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { useTheme } from '~/content/theme/useTheme';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export type InputProps = {
  className?: string;
  element?: 'input' | 'textarea';
  onChange?: (value: string) => void;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'autoComplete' | 'autoFocus' | 'disabled' | 'onPaste' | 'placeholder' | 'type' | 'value'
>;

export const Input: React.FC<InputProps> = (props) => {
  const { className, element: Element = 'input', onChange: onChangeProp, ...inputProps } = props;

  const { mode } = useTheme();

  const ref = useRef<HTMLTextAreaElement | null>(null);

  const updateHeight = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      if (Element === 'textarea') {
        const textArea = element as HTMLTextAreaElement;
        textArea.style.height = 'auto';
        textArea.style.height = `${Math.max(36, Math.min(200, textArea.scrollHeight))}px`;
      }
    },
    [Element],
  );

  const onChange = useCallback(
    (event: React.ChangeEvent) => {
      const element = event.target as HTMLInputElement | HTMLTextAreaElement;
      onChangeProp?.(element.value);
      updateHeight(element);
    },
    [onChangeProp, updateHeight],
  );

  useEffectOnce(() => {
    setTimeout(() => {
      updateHeight(ref.current!);
    }, 50);
  });

  return (
    <Element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(inputProps as any)}
      className={classNames(
        'block w-full rounded-lg border-[1.5px] border-border bg-background px-2 py-[6.5px] text-sm font-medium text-textSecondary outline-none focus:border-primary disabled:opacity-50',
        className,
        {
          'resize-none overflow-hidden focus:overflow-auto': Element === 'textarea',
        },
      )}
      onChange={onChange}
      ref={
        Element === 'textarea'
          ? (ref as React.RefObject<HTMLInputElement> & React.RefObject<HTMLTextAreaElement>)
          : undefined
      }
      rows={Element === 'textarea' ? 1 : undefined}
      style={{ colorScheme: mode }}
    />
  );
};
