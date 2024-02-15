import classNames from 'classnames';
import React, { ReactNode } from 'react';

export type InputProps = {
  className?: string;
  onChange: (value: string) => void;
  suffix?: ReactNode;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'autoFocus' | 'onClick' | 'placeholder' | 'readOnly' | 'type' | 'value'
>;

export const Input: React.FC<InputProps> = (props) => {
  const { className, onChange, ...inputProps } = props;

  return (
    <input
      {...inputProps}
      className={classNames(
        'block h-[36px] w-full rounded-lg border-[1.5px] border-gray-300 bg-gray-50 p-2 text-sm font-medium leading-none text-gray-700 outline-none focus:border-blue-600',
        {
          'opacity-50': props.readOnly,
        },
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
