import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

export type CardProps = PropsWithChildren<{
  className?: string;
  id?: string;
  role?: string;
}>;

export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { children, className, id, role } = props;

  return (
    <div
      className={classNames('overflow-auto rounded-xl border border-border bg-card p-2', className)}
      id={id}
      ref={ref}
      role={role}
    >
      {children}
    </div>
  );
});
