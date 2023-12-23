import React from 'react';

export type InputProps = {
  label?: string;
  onChange: (value: string) => void;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  value: string;
};

export const Input: React.FC<InputProps> = (props) => {
  const { label, onChange, type, value } = props;

  return (
    <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <input
        className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium leading-none text-gray-700 outline-none focus:border-blue-600"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
};
