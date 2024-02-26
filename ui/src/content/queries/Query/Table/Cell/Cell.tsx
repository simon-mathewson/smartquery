import classNames from 'classnames';
import React from 'react';
import type { Column, Value } from '~/content/queries/types';
import { isDateTimeType, isNumberType, isTimeType } from '../EditOverlay/ColumnField/utils';

export type CellProps = {
  column: Column | string;
  header?: boolean;
  hover?: boolean;
  isChanged?: boolean;
  rootProps?: React.HTMLAttributes<HTMLDivElement> & { [dataAttr: `data-${string}`]: string };
  selected?: boolean;
  value: Value;
};

export const Cell: React.FC<CellProps> = (props) => {
  const { column, header, hover, isChanged, rootProps, selected, value } = props;

  return (
    <div
      className={classNames(
        'flex h-8 max-w-[240px] items-center border-b px-4 transition-colors duration-100',
        {
          'sticky top-0 z-10 h-10 bg-card': header,
          'py-2': !header,
          'border-b-border': header || (!selected && !isChanged),
          'border-b-whiteHighlightHover': !header && selected,
          'border-b-yellow-500/20': !header && !selected && isChanged,
          'bg-secondaryHighlight': !isChanged && !selected && hover,
          'bg-primaryHover': !isChanged && selected && hover,
          'bg-primary': !isChanged && selected && !hover,
          'bg-yellow-500/20': isChanged && !selected && !hover,
          'bg-yellow-500/30': isChanged && !selected && hover,
          'bg-blue-500/80': isChanged && selected && !hover,
          'bg-blue-500/70': isChanged && selected && hover,
        },
      )}
      {...rootProps}
    >
      <div
        className={classNames('overflow-hidden text-ellipsis whitespace-nowrap text-xs', {
          'font-mono font-medium text-textPrimary': header,
          'text-white': selected,
          'font-mono font-medium':
            !header &&
            (value === null ||
              (typeof column === 'object' &&
                (['boolean', 'json'].includes(column.dataType) ||
                  isDateTimeType(column.dataType) ||
                  isNumberType(column.dataType) ||
                  isTimeType(column.dataType)))),
        })}
      >
        {value === null ? 'NULL' : value}
      </div>
    </div>
  );
};
