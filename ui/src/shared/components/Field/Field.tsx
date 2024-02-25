import type { PropsWithChildren } from 'react';
import React from 'react';

export type FieldProps = {
  label?: string;
};

export const Field: React.FC<PropsWithChildren<FieldProps>> = (props) => {
  const { children, label } = props;

  return (
    <div className="focus-within:text-primary grid gap-1">
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <div className="flex gap-2 overflow-hidden">{children}</div>
    </div>
  );
};
