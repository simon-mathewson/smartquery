import classNames from 'classnames';
import React from 'react';
import type { Column, Value } from '~/shared/types';
import { isDateTimeType, isNumberType, isTimeType } from '../EditOverlay/ColumnField/utils';

export type CellProps = {
  column: Column | string;
  header?: boolean;
  isChanged?: boolean;
  isDeleted?: boolean;
  rootProps?: React.HTMLAttributes<HTMLDivElement> & { [dataAttr: `data-${string}`]: string };
  selected?: boolean;
  value: Value;
};

export const Cell: React.FC<CellProps> = (props) => {
  const { column, header, isChanged, isDeleted, rootProps, selected, value } = props;

  return (
    <div
      className={classNames(
        'flex h-8 max-w-[240px] items-center px-4 transition-colors duration-100',
        (() => {
          if (header) return undefined;

          if (isChanged) {
            if (selected) {
              return 'bg-indigo-500 data-[row-hover=true]:bg-indigo-500/90';
            }
            return 'bg-yellow-500/30 data-[row-hover=true]:bg-yellow-500/40';
          }
          if (isDeleted) {
            if (selected) {
              return 'bg-violet-500 data-[row-hover=true]:bg-violet-500/90';
            }
            return 'bg-red-500/30 data-[row-hover=true]:bg-red-500/40';
          }
          if (selected) {
            return 'bg-primary data-[row-hover=true]:bg-primary/90';
          }
          return 'data-[row-hover=true]:bg-secondaryHighlight ';
        })(),
        {
          'sticky top-0 z-30 h-10 border-b bg-card': header,
          '-mt-[1px] border-y py-2': !header,
          'z-10 border-y-whiteHighlightHover': !header && selected,
          'border-y-border': header || (!selected && !isChanged && !isDeleted),
          'z-10 border-y-transparent': !header && !selected && (isChanged || isDeleted),
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
