import type { XOR } from 'ts-essentials';
import classNames from 'classnames';
import React from 'react';
import { type Column, type Value } from '~/shared/types';
import { isDateTimeType, isNumberType, isTimeType } from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueryContext } from '../../Context';
import type { CreateValue } from '~/content/edit/types';
import type { useSorting } from '../sorting/useSorting';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';

export type CellProps = {
  column: Column | string;
  value: Value | CreateValue;
} & XOR<
  {
    sorting: ReturnType<typeof useSorting>;
    type: 'header';
  },
  {
    columnIndex: number;
    isChanged?: boolean;
    isCreated?: boolean;
    isDeleted?: boolean;
    onClick?: (
      event: React.MouseEvent<HTMLDivElement>,
      rowIndex: number,
      columnIndex: number,
    ) => void;
    rowIndex: number;
    selection: number[][];
    type: 'body';
  }
>;

export const Cell: React.FC<CellProps> = (props) => {
  const {
    column,
    columnIndex,
    isCreated,
    isChanged,
    isDeleted,
    onClick,
    rowIndex,
    selection,
    sorting,
    type,
    value,
  } = props;

  const { query } = useDefinedContext(QueryContext);

  const selected =
    type === 'body' &&
    selection[rowIndex] &&
    (selection[rowIndex].length === 0 || selection[rowIndex].includes(columnIndex));

  return (
    <div
      className={classNames(
        'group flex h-8 max-w-[240px] items-center justify-between gap-2 px-4 transition-colors duration-100',
        (() => {
          if (type === 'header') return undefined;

          if (isCreated) {
            if (selected) {
              return 'bg-teal-600/80 data-[row-hover=true]:bg-teal-600/70';
            }
            return 'bg-green-500/30 data-[row-hover=true]:bg-green-500/40';
          }
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
          'sticky top-0 z-30 h-10 border-b bg-card': type === 'header',
          'cursor-pointer': query.select,
          '-mt-[1px] border-y py-2': type === 'body',
          'z-10 border-y-whiteHighlightHover': type === 'body' && selected,
          'border-y-border':
            type === 'header' || (!selected && !isChanged && !isDeleted && !isCreated),
          'z-10 border-y-transparent':
            type === 'body' && !selected && (isChanged || isDeleted || isCreated),
        },
      )}
      {...(type === 'body'
        ? {
            'data-cell-column': String(columnIndex),
            'data-cell-row': String(rowIndex),
            onClick: (event) => onClick?.(event, rowIndex, columnIndex),
            onMouseEnter: () =>
              document
                .querySelectorAll(`[data-query="${query.id}"] [data-cell-row="${rowIndex}"]`)
                .forEach((el) => {
                  (el as HTMLElement).dataset.rowHover = 'true';
                }),
            onMouseLeave: () =>
              document
                .querySelectorAll(`[data-query="${query.id}"] [data-cell-row="${rowIndex}"]`)
                .forEach((el) => {
                  (el as HTMLElement).dataset.rowHover = 'false';
                }),
          }
        : {
            onClick: () => {
              if (!query.select) return;
              sorting.toggleSort((column as Column).name);
            },
          })}
    >
      <div
        className={classNames('overflow-hidden text-ellipsis whitespace-nowrap text-xs', {
          'font-mono font-medium text-textPrimary': type === 'header',
          'text-white': selected,
          'font-mono font-medium':
            type === 'body' &&
            (value === null ||
              value === undefined ||
              (typeof column === 'object' &&
                (['boolean', 'json'].includes(column.dataType) ||
                  isDateTimeType(column.dataType) ||
                  isNumberType(column.dataType) ||
                  isTimeType(column.dataType)))),
        })}
      >
        {(() => {
          if (value === null) {
            return 'NULL';
          }
          if (value === undefined) {
            return 'EMPTY';
          }
          return value;
        })()}
      </div>
      {query.select && sorting && (
        <>
          {sorting.sortedColumn?.columnName !== (column as Column).name ||
          sorting.sortedColumn.direction === 'ASC' ? (
            <ArrowUpward
              className={classNames('!h-4 !w-4 text-primary', {
                'opacity-0 group-hover:opacity-50':
                  sorting.sortedColumn?.columnName !== (column as Column).name,
              })}
            />
          ) : (
            <ArrowDownward className="!h-4 !w-4 text-primary" />
          )}
        </>
      )}
    </div>
  );
};
