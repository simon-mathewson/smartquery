import classNames from 'classnames';
import { includes } from 'lodash';
import React, { useCallback, useContext } from 'react';
import { useTheme } from '~/content/theme/useTheme';
import { FieldContext } from '../field/FieldContext';
import { mergeRefs } from 'react-merge-refs';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';

export type InputProps = {
  hidden?: boolean;
  onChange?: (value: string) => void;
} & (
  | {
      element?: 'input';
      htmlProps?: React.HTMLProps<HTMLInputElement>;
    }
  | {
      element: 'textarea';
      htmlProps?: React.HTMLProps<HTMLTextAreaElement>;
    }
);

export const Input: React.FC<InputProps> = (props) => {
  const { element: Element = 'input', hidden, htmlProps, onChange: onChangeProp } = props;

  const { mode } = useTheme();
  const fieldContext = useContext(FieldContext);

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

  const inputType = htmlProps && 'type' in htmlProps ? htmlProps.type : undefined;

  const getRole = useCallback(() => {
    if (includes(['datetime-local', 'time'], inputType)) {
      return 'textbox';
    }

    return undefined;
  }, [inputType]);

  // Select value on focus
  const onFocus = useCallback((event: React.FocusEvent) => {
    const element = event.target as HTMLInputElement | HTMLTextAreaElement;
    element.select();
  }, []);

  // Prevent changing the value on scroll
  const onWheel = useCallback((event: WheelEvent) => {
    if (
      event.target === document.activeElement &&
      event.target instanceof HTMLInputElement &&
      event.target.type === 'number'
    ) {
      event.target.blur();
    }
  }, []);

  const registerElement = useCallback(
    (el: (HTMLInputElement & HTMLTextAreaElement) | null) => {
      if (!el) return;

      el.addEventListener('wheel', onWheel);

      if (Element !== 'textarea') {
        return;
      }

      updateHeight(el);
    },
    [Element, onWheel, updateHeight],
  );

  return (
    <Element
      role={getRole()}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(htmlProps as any)}
      className={classNames(
        'block w-full rounded-lg border-[1.5px] border-border bg-background px-2 py-[6.5px] text-sm font-medium text-textSecondary outline-none focus:border-primary disabled:opacity-50',
        htmlProps?.className,
        {
          'resize-none overflow-hidden focus:overflow-auto': Element === 'textarea',
        },
      )}
      id={!hidden ? fieldContext?.controlId : undefined}
      onChange={onChange}
      onFocus={onFocus}
      ref={mergeRefs(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [registerElement, htmlProps?.ref as React.RefObject<any> | undefined].filter(
          isNotUndefined,
        ),
      )}
      rows={Element === 'textarea' ? 1 : undefined}
      style={{ colorScheme: mode }}
    />
  );
};
