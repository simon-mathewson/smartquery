import React, { ReactNode } from 'react';

export type InputProps = {
  onChange: (value: string) => void;
  suffix?: ReactNode;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'autoFocus' | 'placeholder' | 'type' | 'value'
>;

export const Input: React.FC<InputProps> = (props) => {
  const { onChange, ...inputProps } = props;

  return (
    <input
      {...inputProps}
      className={
        'block w-full rounded-lg border-[1.5px] border-gray-300 bg-gray-50 p-2 text-sm font-medium leading-none text-gray-700 outline-none focus:border-blue-600'
      }
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
