import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  className?: string;
  color?: 'black' | 'danger' | 'primary' | 'secondary' | 'success' | 'white';
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  monospace?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  size?: 'small' | 'normal';
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant?: 'default' | 'filled' | 'selected';
};

export const Button = React.forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const {
    align = 'center',
    className,
    color = 'primary',
    disabled,
    icon,
    label,
    monospace,
    onClick,
    size = 'normal',
    type = 'button',
    variant = 'default',
  } = props;

  return (
    <button
      className={classNames(
        'flex h-[36px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 [&>svg]:text-[20px]',
        {
          '!h-[28px]': size === 'small',
          '!rounded-full': icon && !label,
          '!px-2': icon && !label && size === 'normal',
          '!p-1': icon && !label && size === 'small',
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
          'pointer-events-none opacity-50': disabled,
          'font-mono font-medium': monospace,

          'hover:bg-blackHighlight text-black [&>svg]:text-black':
            color === 'black' && variant === 'default',
          'hover:bg-blackHover bg-black text-white [&>svg]:text-white':
            color === 'black' && variant === 'filled',
          'bg-blackHighlight hover:bg-blackHighlightHover text-black':
            color === 'black' && variant === 'selected',

          'hover:bg-dangerHighlight [&>svg]:text-danger text-danger':
            color === 'danger' && variant === 'default',
          'bg-danger hover:bg-dangerHover text-white [&>svg]:text-white':
            color === 'danger' && variant === 'filled',
          'bg-dangerHighlight hover:bg-dangerHighlightHover text-danger':
            color === 'danger' && variant === 'selected',

          'hover:bg-primaryHighlight [&>svg]:text-primary text-primary':
            color === 'primary' && variant === 'default',
          'bg-primary hover:bg-primaryHover text-white [&>svg]:text-white':
            color === 'primary' && variant === 'filled',
          'bg-primaryHighlight hover:bg-primaryHighlightHover text-primary':
            color === 'primary' && variant === 'selected',

          'hover:bg-secondaryHighlight [&>svg]:text-secondary text-secondary':
            color === 'secondary' && variant === 'default',
          'bg-secondary hover:bg-secondaryHover text-white [&>svg]:text-white':
            color === 'secondary' && variant === 'filled',
          'bg-secondaryHighlight hover:bg-secondaryHighlightHover text-secondary':
            color === 'secondary' && variant === 'selected',

          'hover:bg-successHighlight [&>svg]:text-success text-success':
            color === 'success' && variant === 'default',
          'bg-success hover:bg-successHover text-white [&>svg]:text-white':
            color === 'success' && variant === 'filled',
          'bg-successHighlight hover:bg-successHighlightHover text-success':
            color === 'success' && variant === 'selected',

          'hover:bg-whiteHighlight text-white [&>svg]:text-white':
            color === 'white' && variant === 'default',
          'hover:bg-whiteHover bg-white text-black [&>svg]:text-black':
            color === 'white' && variant === 'filled',
          'bg-whiteHighlight hover:bg-whiteHighlightHover text-white':
            color === 'white' && variant === 'selected',
        },
        className,
      )}
      onClick={onClick}
      ref={ref}
      type={type}
    >
      {icon}
      {label && <div className="text-sm font-medium leading-none">{label}</div>}
    </button>
  );
});
