import classNames from 'classnames';
import React from 'react';

export type HeaderProps = {
  compact?: boolean;
  evenColumns?: boolean;
  left?: React.ReactNode;
  middle?: React.ReactNode;
  right?: React.ReactNode;
};

export const Header: React.FC<HeaderProps> = (props) => {
  const { compact, evenColumns, left, middle, right } = props;

  return (
    <div
      className={classNames(
        'grid h-9 w-full shrink-0 grid-cols-[minmax(36px,_max-content)_1fr_minmax(36px,_max-content)] gap-2 text-sm font-medium text-textPrimary',
        {
          '!grid-cols-[1fr,1fr,1fr]': evenColumns,
          '!h-6': compact,
        },
      )}
    >
      <div className="flex items-center justify-start gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {left}
      </div>
      <div className="flex items-center justify-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {middle}
      </div>
      <div className="flex items-center justify-end gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-right">
        {right}
      </div>
    </div>
  );
};
