import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

export const ErrorMessage: React.FC<
  PropsWithChildren<{ htmlProps?: React.HTMLProps<HTMLDivElement> }>
> = ({ children, htmlProps }) => {
  return (
    <div
      {...htmlProps}
      className={classNames(
        'rounded-lg bg-dangerHighlight px-2 py-1 text-xs font-medium leading-normal text-danger',
        htmlProps?.className,
      )}
    >
      {children}
    </div>
  );
};
