import React, { PropsWithChildren } from 'react';

export type FieldProps = {
  label?: string;
};

export const Field: React.FC<PropsWithChildren<FieldProps>> = (props) => {
  const { children, label } = props;

  return (
    <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <div className="flex">{children}</div>
    </label>
  );
};
