import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';

export type FieldProps = {
  className?: string;
  label?: string;
};

export const Field: React.FC<PropsWithChildren<FieldProps>> = (props) => {
  const { children, className, label } = props;

  return (
    <div className={classNames('grid gap-1 focus-within:text-primary', className)}>
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <div className="flex gap-2 overflow-hidden">{children}</div>
    </div>
  );
};
