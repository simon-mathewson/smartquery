import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  align?: 'left' | 'center' | 'right';
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant?: 'primary' | 'secondary' | 'danger';
};

export const Button = React.forwardRef<HTMLButtonElement | null, ButtonProps>((props, ref) => {
  const {
    align = 'center',
    className,
    icon,
    label,
    onClick,
    type = 'button',
    variant = 'secondary',
  } = props;

  return (
    <button
      className={classNames(
        'flex h-[36px] w-full cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-blue-500/10 [&>svg]:text-[20px] [&>svg]:text-blue-500',
        className,
        {
          'bg-blue-500 hover:bg-blue-500/90 [&>svg]:text-white': variant === 'primary',
          'hover:bg-red-500/10 [&>svg]:text-red-500': variant === 'danger',
          'rounded-full': icon && !label,
          'justify-start': align === 'left',
          'justify-center': align === 'center',
          'justify-end': align === 'right',
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
            'text-white': variant === 'primary',
            'text-red-500': variant === 'danger',
          })}
        >
          {label}
        </div>
      )}
    </button>
  );
});
