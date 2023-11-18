import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  onClick?: (event: React.MouseEvent) => void;
  selected?: boolean;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'light';
};

export const Button = React.forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const {
    align = 'center',
    className,
    disabled,
    icon,
    label,
    onClick,
    selected,
    type = 'button',
    variant = 'secondary',
  } = props;

  return (
    <button
      className={classNames(
        'flex h-[36px] cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-blue-500/10 [&>svg]:text-[20px] [&>svg]:text-blue-500',
        className,
        {
          'bg-blue-500 hover:bg-blue-500/90 [&>svg]:text-white': variant === 'primary',
          'hover:bg-red-500/10 [&>svg]:text-red-500': variant === 'danger',
          'hover:bg-green-500/10 [&>svg]:text-green-500': variant === 'success',
          'hover:bg-white/10 [&>svg]:text-white': variant === 'light',
          'rounded-full': icon && !label,
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
          'bg-blue-500/5 hover:bg-blue-500/10': selected && variant === 'secondary',
          'bg-red-500/5 hover:bg-red-500/10': selected && variant === 'danger',
          'bg-blue-600/5 hover:bg-red-600/10': selected && variant === 'primary',
          'pointer-events-none opacity-50': disabled,
        },
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
          })}
        >
          {label}
        </div>
      )}
    </button>
  );
});
