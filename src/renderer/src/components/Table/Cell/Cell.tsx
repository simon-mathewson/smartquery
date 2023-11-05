import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

export type CellProps = {
  header?: boolean;
};

export const Cell: React.FC<PropsWithChildren<CellProps>> = (props) => {
  const { children, header } = props;

  return (
    <div
      className={classNames('border-b-[1px] border-b-gray-200 px-4 flex items-center max-w-xs', {
        'h-10 sticky top-0 bg-white': header,
        'border-b-gray-100 py-2': !header,
      })}
    >
      <div
        className={classNames('text-xs text-ellipsis overflow-hidden whitespace-nowrap', {
          'font-medium text-gray-800 font-mono': header,
          'text-gray-600': !header,
        })}
      >
        {children}
      </div>
    </div>
  );
};
