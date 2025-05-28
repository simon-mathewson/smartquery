import classNames from 'classnames';
import React, { useState } from 'react';
import type { Color } from '~/content/theme/types';
import { v4 as uuid } from 'uuid';
import type { BrowserLocationHook } from 'wouter/use-browser-location';
import type { LinkProps } from 'wouter';
import { Link } from 'wouter';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  color?: Color;
  htmlProps?: React.HTMLProps<HTMLButtonElement>;
  icon?: React.ReactNode;
  label?: string;
  monospace?: boolean;
  size?: 'small' | 'normal';
  suffix?: React.ReactNode;
  textSuffix?: string;
  variant?: 'default' | 'filled' | 'highlighted';
} & (
  | {
      element: 'a';
      htmlProps?: React.HTMLProps<HTMLAnchorElement>;
    }
  | {
      element?: 'button';
      htmlProps?: React.HTMLProps<HTMLButtonElement>;
    }
  | {
      element: 'div';
      htmlProps?: React.HTMLProps<HTMLDivElement>;
    }
  | {
      element: 'link';
      htmlProps?: React.HTMLProps<LinkProps<BrowserLocationHook>>;
    }
);

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    align = 'center',
    color = 'primary',
    element = 'button',
    htmlProps,
    icon,
    label,
    monospace,
    size = 'normal',
    suffix,
    textSuffix,
    variant = 'default',
  } = props;

  const Element = element === 'link' ? Link : element;

  const [labelId] = useState(() => uuid());

  return (
    <Element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props.htmlProps as any)}
      aria-disabled={props.htmlProps?.disabled}
      aria-labelledby={label ? labelId : undefined}
      className={classNames(
        'flex h-[36px] cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 [&>svg]:text-[20px]',
        {
          '!h-[24px] !gap-1 [&>svg]:h-[16px] [&>svg]:w-[16px]': size === 'small',
          '!rounded-full': icon && !label,
          '!px-2': icon && !label && size === 'normal',
          '!p-1': icon && !label && size === 'small',
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
          'pointer-events-none opacity-50': htmlProps?.disabled,
          'font-mono font-medium': monospace,

          'text-black hover:bg-blackHighlight focus:bg-blackHighlight [&>svg]:text-black':
            color === 'black' && variant === 'default',
          'bg-black text-white hover:bg-blackHover focus:bg-blackHover [&>svg]:text-white':
            color === 'black' && variant === 'filled',
          'bg-blackHighlight text-black hover:bg-blackHighlightHover focus:bg-blackHighlightHover':
            color === 'black' && variant === 'highlighted',

          'text-danger hover:bg-dangerHighlight focus:bg-dangerHighlight [&>svg]:text-danger':
            color === 'danger' && variant === 'default',
          'bg-danger text-white hover:bg-dangerHover focus:bg-dangerHover [&>svg]:text-white':
            color === 'danger' && variant === 'filled',
          'bg-dangerHighlight text-danger hover:bg-dangerHighlightHover focus:bg-dangerHighlightHover':
            color === 'danger' && variant === 'highlighted',

          'text-primary hover:bg-primaryHighlight focus:bg-primaryHighlight [&>svg]:text-primary':
            color === 'primary' && variant === 'default',
          'bg-primary text-white hover:bg-primaryHover focus:bg-primaryHover [&>svg]:text-white':
            color === 'primary' && variant === 'filled',
          'bg-primaryHighlight text-primary hover:bg-primaryHighlightHover focus:bg-primaryHighlightHover':
            color === 'primary' && variant === 'highlighted',

          'text-secondary hover:bg-secondaryHighlight focus:bg-secondaryHighlight [&>svg]:text-secondary':
            color === 'secondary' && variant === 'default',
          'bg-secondary text-white hover:bg-secondaryHover focus:bg-secondaryHover [&>svg]:text-white':
            color === 'secondary' && variant === 'filled',
          'bg-secondaryHighlight text-secondary hover:bg-secondaryHighlightHover focus:bg-secondaryHighlightHover':
            color === 'secondary' && variant === 'highlighted',

          'text-success hover:bg-successHighlight focus:bg-successHighlight [&>svg]:text-success':
            color === 'success' && variant === 'default',
          'bg-success text-white hover:bg-successHover focus:bg-successHover [&>svg]:text-white':
            color === 'success' && variant === 'filled',
          'bg-successHighlight text-success hover:bg-successHighlightHover focus:bg-successHighlightHover':
            color === 'success' && variant === 'highlighted',

          'text-white hover:bg-whiteHighlight focus:bg-whiteHighlight [&>svg]:text-white':
            color === 'white' && variant === 'default',
          'bg-white text-black hover:bg-whiteHover focus:bg-whiteHover [&>svg]:text-black':
            color === 'white' && variant === 'filled',
          'bg-whiteHighlight text-white hover:bg-whiteHighlightHover focus:bg-whiteHighlightHover':
            color === 'white' && variant === 'highlighted',
        },
        htmlProps?.className,
      )}
      type={htmlProps?.type ?? 'button'}
    >
      {icon}
      {label && (
        <div className="truncate text-sm font-medium" id={labelId}>
          {label}
        </div>
      )}
      {textSuffix && <div className="text-sm font-medium">{textSuffix}</div>}
      {suffix}
    </Element>
  );
};
