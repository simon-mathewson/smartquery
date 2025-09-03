import classNames from 'classnames';

export const Cell = ({
  children,
  className,
  feature,
}: {
  children?: React.ReactNode;
  className?: string;
  feature?: boolean;
}) => (
  <div
    className={classNames('flex w-full items-center gap-2 p-2', className, {
      'sticky left-0 z-10 bg-card text-xs font-medium text-textPrimary': feature,
    })}
  >
    {children}
  </div>
);
