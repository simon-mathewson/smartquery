import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

export type CellProps = {
  header?: boolean;
};

export const Cell: React.FC<PropsWithChildren<CellProps>> = (props) => {
  const { children, header } = props;

  return (
    <div
      className={classNames('flex h-8 max-w-[176px] items-center border-b border-b-gray-200 px-4', {
        'sticky top-0 h-10 bg-gray-50': header,
        ' border-b-gray-200 py-2': !header,
      })}
    >
      <div
        className={classNames('overflow-hidden text-ellipsis whitespace-nowrap text-xs', {
          'font-mono font-medium text-gray-800': header,
          'text-gray-500': !header,
        })}
      >
        {children}
      </div>
    </div>
  );
};
