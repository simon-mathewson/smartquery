import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { forwardRef } from 'react';

export type CardProps = PropsWithChildren<{
  className?: string;
}>;

export const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const { children, className } = props;

  return (
    <div
      className={classNames('overflow-auto rounded-xl border border-border bg-card p-2', className)}
      ref={ref}
    >
      {children}
    </div>
  );
});
