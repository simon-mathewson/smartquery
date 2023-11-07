import React from 'react';

export type InputProps = {
  onChange: (value: string | null) => void;
  value: string | null;
};

export const Input: React.FC<InputProps> = (props) => {
  const { onChange, value } = props;

  return (
    <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
      <div className="pl-1 text-sm font-medium">Name</div>
      <input
        onChange={(event) => onChange(event.target.value || null)}
        value={value ?? ''}
        className="block w-full rounded-lg border-2 border-gray-300 p-2 text-gray-700 outline-none focus:border-blue-600"
      />
    </label>
  );
};
