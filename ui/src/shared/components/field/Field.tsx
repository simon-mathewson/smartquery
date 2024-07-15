import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React, { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FieldContext } from './FieldContext';

export type FieldProps = {
  className?: string;
  label?: string;
};

export const Field: React.FC<PropsWithChildren<FieldProps>> = (props) => {
  const { children, className, label } = props;

  const [controlId] = useState(uuid());

  return (
    <FieldContext.Provider value={useMemo(() => ({ controlId }), [controlId])}>
      <div className={classNames('grid gap-1 focus-within:text-primary', className)}>
        {label && (
          <label className="block pl-1 text-xs font-medium" htmlFor={controlId}>
            {label}
          </label>
        )}
        <div className="flex gap-2 overflow-hidden">{children}</div>
      </div>
    </FieldContext.Provider>
  );
};
