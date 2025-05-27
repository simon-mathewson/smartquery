import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React, { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FieldContext } from './FieldContext';

export type FieldProps = {
  error?: string;
  hint?: React.ReactNode;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  label?: string;
};

export const Field: React.FC<PropsWithChildren<FieldProps>> = (props) => {
  const { children, htmlProps, hint, label, error } = props;

  const [controlId] = useState(uuid());
  const [labelId] = useState(uuid());

  return (
    <FieldContext.Provider
      value={useMemo(
        () => ({
          controlHtmlProps: {
            'aria-labelledby': label === undefined ? undefined : labelId,
            id: controlId,
          },
        }),
        [controlId, label, labelId],
      )}
    >
      <div className={classNames('grid gap-1 focus-within:text-primary', htmlProps?.className)}>
        {label && (
          <label className="block pl-1 text-xs font-medium" htmlFor={controlId} id={labelId}>
            {label}
          </label>
        )}
        <div className="flex gap-2 overflow-hidden">{children}</div>
        {hint && <div className="px-1 text-xs text-textTertiary">{hint}</div>}
        {error && <div className="px-1 text-xs text-danger">{error}</div>}
      </div>
    </FieldContext.Provider>
  );
};
