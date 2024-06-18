import classNames from 'classnames';
import type { MutableRefObject } from 'react';
import React from 'react';
import type { Color } from '~/content/theme/types';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  className?: string;
  color?: Color;
  disabled?: boolean;
  element?: 'a' | 'button' | 'div';
  href?: string;
  icon?: React.ReactNode;
  label?: string;
  monospace?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onClickCapture?: (event: React.MouseEvent) => void;
  size?: 'small' | 'normal';
  suffix?: React.ReactNode;
  textSuffix?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant?: 'default' | 'filled' | 'highlighted';
};

export const Button = React.forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const {
    align = 'center',
    className,
    color = 'primary',
    disabled,
    element: Element = 'button',
    href,
    icon,
    label,
    monospace,
    onClick,
    onClickCapture,
    size = 'normal',
    suffix,
    textSuffix,
    type = 'button',
    variant = 'default',
  } = props;

  return (
    <Element
      aria-disabled={disabled}
      aria-label={label}
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
          'pointer-events-none opacity-50': disabled,
          'font-mono font-medium': monospace,

          'text-black hover:bg-blackHighlight [&>svg]:text-black':
            color === 'black' && variant === 'default',
          'bg-black text-white hover:bg-blackHover [&>svg]:text-white':
            color === 'black' && variant === 'filled',
          'bg-blackHighlight text-black hover:bg-blackHighlightHover':
            color === 'black' && variant === 'highlighted',

          'text-danger hover:bg-dangerHighlight [&>svg]:text-danger':
            color === 'danger' && variant === 'default',
          'bg-danger text-white hover:bg-dangerHover [&>svg]:text-white':
            color === 'danger' && variant === 'filled',
          'bg-dangerHighlight text-danger hover:bg-dangerHighlightHover':
            color === 'danger' && variant === 'highlighted',

          'text-primary hover:bg-primaryHighlight [&>svg]:text-primary':
            color === 'primary' && variant === 'default',
          'bg-primary text-white hover:bg-primaryHover [&>svg]:text-white':
            color === 'primary' && variant === 'filled',
          'bg-primaryHighlight text-primary hover:bg-primaryHighlightHover':
            color === 'primary' && variant === 'highlighted',

          'text-secondary hover:bg-secondaryHighlight [&>svg]:text-secondary':
            color === 'secondary' && variant === 'default',
          'bg-secondary text-white hover:bg-secondaryHover [&>svg]:text-white':
            color === 'secondary' && variant === 'filled',
          'bg-secondaryHighlight text-secondary hover:bg-secondaryHighlightHover':
            color === 'secondary' && variant === 'highlighted',

          'text-success hover:bg-successHighlight [&>svg]:text-success':
            color === 'success' && variant === 'default',
          'bg-success text-white hover:bg-successHover [&>svg]:text-white':
            color === 'success' && variant === 'filled',
          'bg-successHighlight text-success hover:bg-successHighlightHover':
            color === 'success' && variant === 'highlighted',

          'text-white hover:bg-whiteHighlight [&>svg]:text-white':
            color === 'white' && variant === 'default',
          'bg-white text-black hover:bg-whiteHover [&>svg]:text-black':
            color === 'white' && variant === 'filled',
          'bg-whiteHighlight text-white hover:bg-whiteHighlightHover':
            color === 'white' && variant === 'highlighted',
        },
        className,
      )}
      href={href}
      onClick={onClick}
      onClickCapture={onClickCapture}
      ref={
        ref as MutableRefObject<HTMLAnchorElement | null> &
          MutableRefObject<HTMLButtonElement | null> &
          MutableRefObject<HTMLDivElement | null>
      }
      type={type}
    >
      {icon}
      {label && <div className="truncate text-sm font-medium">{label}</div>}
      {textSuffix && <div className="text-sm font-medium">{textSuffix}</div>}
      {suffix}
    </Element>
  );
});
