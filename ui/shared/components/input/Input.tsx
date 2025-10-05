import classNames from 'classnames';
import { includes } from 'lodash';
import React, { useCallback, useContext } from 'react';
import { FieldContext } from '../field/FieldContext';
import { mergeRefs } from 'react-merge-refs';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeContext } from '~/content/theme/Context';

export type InputProps = {
  hidden?: boolean;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  small?: boolean;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
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
  const {
    element: Element = 'input',
    hidden,
    htmlProps,
    icon,
    onChange: onChangeProp,
    small,
    wrapperProps,
  } = props;

  const { mode } = useDefinedContext(ThemeContext);
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
    <div className={classNames('group relative w-full', { hidden })} {...wrapperProps}>
      {icon && (
        <div
          className={classNames(
            'icon-wrapper pointer-events-none absolute left-0 top-0 flex h-[36px] w-[36px] items-center justify-center text-textTertiary group-focus-within:text-primary [&_svg]:h-[20px] [&_svg]:w-[20px]',
            {
              '!h-[28px] !w-[28px] [&_svg]:!h-[16px] [&_svg]:!w-[16px]': small,
            },
          )}
        >
          {icon}
        </div>
      )}
      <Element
        role={getRole()}
        {...(hidden ? {} : fieldContext?.controlHtmlProps)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(htmlProps as any)}
        className={classNames(
          'block w-full rounded-lg border-[1px] border-border bg-background px-2 py-[7px] text-sm font-medium text-textSecondary outline-none focus:border-primary disabled:opacity-50',
          htmlProps?.className,
          {
            'resize-none overflow-hidden focus:overflow-auto': Element === 'textarea',
            'pl-[36px]': icon,
            '!py-[5px] !pl-[28px] text-xs': small,
          },
        )}
        onChange={onChange}
        ref={mergeRefs(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [registerElement, htmlProps?.ref as React.RefObject<any> | undefined].filter(
            isNotUndefined,
          ),
        )}
        rows={Element === 'textarea' ? 1 : undefined}
        style={{ colorScheme: mode }}
      />
    </div>
  );
};
