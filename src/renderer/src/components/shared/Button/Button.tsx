import classNames from 'classnames';
import React from 'react';

export type ButtonProps = {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { className, icon, label, onClick } = props;

  return (
    <div
      className={classNames(
        'flex cursor-pointer items-center justify-center gap-2 rounded-lg p-2 hover:bg-blue-500/10 [&>svg]:text-[20px] [&>svg]:text-blue-500',
        className,
      )}
      onClick={onClick}
    >
      {icon}
      <div className="text-sm font-medium leading-none text-blue-500">{label}</div>
    </div>
  );
};
