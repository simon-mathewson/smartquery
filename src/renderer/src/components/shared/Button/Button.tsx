import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  primary?: boolean;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { className, icon, label, onClick, primary, type } = props;

  return (
    <button
      className={classNames(
        'flex h-[36px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 hover:bg-blue-500/10 [&>svg]:text-[20px] [&>svg]:text-blue-500',
        className,
        { 'bg-blue-500 hover:bg-blue-500/90': primary },
      )}
      onClick={onClick}
      type={type}
    >
      {icon}
      <div
        className={classNames('text-sm font-medium leading-none text-blue-500', {
          'text-white': primary,
        })}
      >
        {label}
      </div>
    </button>
  );
};
