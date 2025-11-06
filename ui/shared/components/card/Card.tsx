import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

export type CardProps = PropsWithChildren<{
  htmlProps?: React.HTMLProps<HTMLDivElement>;
}>;

export const Card: React.FC<CardProps> = (props) => {
  const { children, htmlProps } = props;

  return (
    <div
      {...htmlProps}
      className={classNames(
        'rounded-2xl border border-border bg-card p-2 shadow-2xl',
        htmlProps?.className,
      )}
    >
      {children}
    </div>
  );
};
