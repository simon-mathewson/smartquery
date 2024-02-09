import React from 'react';

export type InputProps = {
  label?: string;
  onChange: (value: string) => void;
} & Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'autoFocus' | 'placeholder' | 'type' | 'value'
>;

export const Input: React.FC<InputProps> = (props) => {
  const { label, onChange, ...inputProps } = props;

  return (
    <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <input
        {...inputProps}
        className="block w-full rounded-lg border-[1.5px] border-gray-300 bg-gray-50 p-2 text-sm font-medium leading-none text-gray-700 outline-none focus:border-blue-600"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
};
