import classNames from 'classnames';
import React from 'react';
import { DateTime } from 'luxon';

export type CellProps = {
  header?: boolean;
  hover?: boolean;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  selected?: boolean;
  value: string | Date;
};

export const Cell: React.FC<CellProps> = (props) => {
  const { header, hover, rootProps, selected, value } = props;

  return (
    <div
      className={classNames(
        'flex h-8 max-w-[176px] items-center border-b border-b-gray-200 px-4 transition-colors duration-100',
        {
          'sticky top-0 h-10 bg-white': header,
          ' border-b-gray-200 py-2': !header,
          'bg-gray-50': hover,
          '!bg-blue-400': hover && selected,
          'bg-blue-500': selected,
        },
      )}
      {...rootProps}
    >
      <div
        className={classNames('overflow-hidden text-ellipsis whitespace-nowrap text-xs', {
          'font-mono font-medium text-gray-800': header,
          'text-gray-500': !header,
          'text-white': selected,
        })}
      >
        {(() => {
          if (value instanceof Date) {
            return DateTime.fromJSDate(value).toFormat('yyyy-MM-dd HH:mm:ss.SSS');
          }
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return value;
        })()}
      </div>
    </div>
  );
};
