import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  monospace?: boolean;
  label?: string;
  onClick?: (event: React.MouseEvent) => void;
  selected?: boolean;
  size?: 'small' | 'normal';
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'light';
};

export const Button = React.forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const {
    align = 'center',
    className,
    disabled,
    icon,
    label,
    monospace,
    onClick,
    selected,
    size = 'normal',
    type = 'button',
    variant = 'secondary',
  } = props;

  return (
    <button
      className={classNames(
        'flex h-[36px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-blue-500/10 [&>svg]:text-[20px] [&>svg]:text-blue-500',
        {
          '!h-[28px]': size === 'small',
          'bg-blue-500 hover:bg-blue-500/90 [&>svg]:text-white': variant === 'primary',
          'hover:bg-red-500/10 [&>svg]:text-red-500': variant === 'danger',
          'hover:bg-green-500/10 [&>svg]:text-green-500': variant === 'success',
          'hover:bg-white/10 [&>svg]:text-white': variant === 'light',
          'hover:bg-gray-500/10 [&>svg]:text-gray-500': variant === 'tertiary',
          '!rounded-full': icon && !label,
          '!px-2': icon && !label && size === 'normal',
          '!p-1': icon && !label && size === 'small',
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
          'bg-blue-500/10 hover:bg-blue-500/20': selected && variant === 'secondary',
          'bg-red-500/10 hover:bg-red-500/20': selected && variant === 'danger',
          'bg-blue-600/10 hover:bg-red-600/20': selected && variant === 'primary',
          'bg-gray-500/10 hover:bg-gray-500/20': selected && variant === 'tertiary',
          'pointer-events-none opacity-50': disabled,
          'font-mono font-medium': monospace,
        },
        className,
      )}
      onClick={onClick}
      ref={ref}
      type={type}
    >
      {icon}
      {label && (
        <div
          className={classNames('text-sm font-medium leading-none text-blue-500', {
            'text-white': variant === 'primary' || variant === 'light',
            'text-red-500': variant === 'danger',
            'text-green-500': variant === 'success',
            'text-gray-500': variant === 'tertiary',
          })}
        >
          {label}
        </div>
      )}
    </button>
  );
});
