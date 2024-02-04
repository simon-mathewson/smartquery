import classNames from 'classnames';
import React from 'react';
import { DateTime } from 'luxon';
import { Value } from '~/content/queries/types';

export type CellProps = {
  header?: boolean;
  hover?: boolean;
  isChanged?: boolean;
  rootProps?: React.HTMLAttributes<HTMLDivElement> & { [dataAttr: `data-${string}`]: string };
  selected?: boolean;
  value: Value;
};

export const Cell: React.FC<CellProps> = (props) => {
  const { header, hover, isChanged, rootProps, selected, value } = props;

  return (
    <div
      className={classNames(
        'flex h-8 max-w-[240px] items-center border-b border-b-gray-200 px-4 transition-colors duration-100',
        {
          'sticky top-0 z-10 h-10 bg-white': header,
          ' border-b-gray-200 py-2': !header,
          'bg-gray-50': hover && !selected,
          'bg-blue-400': selected && hover,
          'bg-blue-500': selected && !hover,
          'bg-amber-100 ': isChanged && !selected && !hover,
          'bg-amber-50 ': isChanged && !selected && hover,
          'bg-sky-500 ': isChanged && selected && !hover,
          'bg-sky-400 ': isChanged && selected && hover,
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
          return String(value);
        })()}
      </div>
    </div>
  );
};
