import { assert, type XOR } from 'ts-essentials';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { type Column, type Value } from '~/shared/types';
import {
  isDateOrTimeType,
  isDateTimeType,
  isEnumType,
  isNumberType,
} from '~/shared/dataTypes/utils';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueryContext } from '../../Context';
import type { CreateValue } from '~/content/edit/types';
import type { useSorting } from '../sorting/useSorting';
import { ArrowForward, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { QueriesContext } from '../../../Context';
import { getSqlForAst } from '~/shared/utils/sqlParser/getSqlForAst';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';
import type { ResizeHandleProps } from '~/shared/components/resizeHandle/ResizeHandle';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { isNil } from 'lodash';
import { compareColumnRefs, getColumnRef } from '../../../utils/columnRefs';

export type CellProps = {
  column: Column | string;
  columnIndex: number;
  visibleColumnCount: number;
  value: Value | CreateValue;
  setColumnWidth: ResizeHandleProps['onResize'];
} & XOR<
  {
    sorting: ReturnType<typeof useSorting>;
    type: 'header';
  },
  {
    isChanged?: boolean;
    isCreated?: boolean;
    isDeleted?: boolean;
    onClick?: (
      event: React.MouseEvent<HTMLDivElement>,
      rowIndex: number,
      columnIndex: number,
    ) => void;
    rowCount: number;
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
    rowCount,
    rowIndex,
    selection,
    setColumnWidth,
    sorting,
    type,
    value,
    visibleColumnCount,
  } = props;

  const { activeConnection } = useDefinedContext(ActiveConnectionContext);

  const { addQuery } = useDefinedContext(QueriesContext);

  const { query } = useDefinedContext(QueryContext);

  const selected =
    type === 'body' &&
    selection[rowIndex] &&
    (selection[rowIndex].length === 0 || selection[rowIndex].includes(columnIndex));

  const openForeignTable = useCallback(async () => {
    assert(typeof column === 'object' && column.foreignKey);

    const { foreignKey } = column;

    const sql = await getSqlForAst(
      {
        type: 'select',
        columns: [{ expr: { type: 'column_ref', column: '*' } }],
        from: [{ db: foreignKey.schema ?? null, table: foreignKey.table, as: null }],
        where: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'column_ref', column: foreignKey.column, table: null },
          right: {
            type: isNumberType(column.dataType) ? 'number' : 'single_quote_string',
            value,
          },
        },
        with: null,
        options: null,
        distinct: null,
        groupby: {
          columns: null,
          modifiers: [],
        },
        having: null,
        orderby: null,
        limit: null,
      },
      { engine: activeConnection.engine },
    );

    void addQuery({ sql, initialInputMode: 'filters' }, { afterActiveTab: true });
  }, [activeConnection.engine, addQuery, column, value]);

  const isSortedColumn = sorting
    ? compareColumnRefs(sorting.sortedColumn, getColumnRef(column as Column))
    : false;

  return (
    <>
      <div
        tabIndex={-1}
        className={classNames(
          'group relative -ml-px flex h-8 select-none items-center justify-between gap-2 overflow-hidden border-l border-l-border px-2 transition-colors duration-100',
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
            'h-10 border-y bg-card': type === 'header',
            'cursor-pointer': type === 'header' && query.select,
            '-mt-[1px] border-y py-2': type === 'body',
            'border-l-0 pl-4': columnIndex === 0,
            'border-b-1': type === 'body' && rowIndex === rowCount - 1,
            'z-10 !border-whiteHighlightHover': type === 'body' && selected,
            'border-y-border':
              type === 'header' || (!selected && !isChanged && !isDeleted && !isCreated),
            'z-10 !border-transparent':
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
                void sorting.toggleSort(column as Column);
              },
            })}
      >
        <ResizeHandle
          position="right"
          onResize={setColumnWidth}
          minWidth={30}
          maxWidth={600}
          offset={8}
        />
        <div
          className={classNames('overflow-hidden text-ellipsis whitespace-nowrap text-xs', {
            'font-mono font-medium text-textPrimary': type === 'header',
            'text-white': selected,
            'font-mono font-medium':
              type === 'body' &&
              (value === null ||
                value === undefined ||
                (typeof column === 'object' &&
                  (column.isUnique ||
                    column.foreignKey ||
                    column.isPrimaryKey ||
                    ['boolean', 'json'].includes(column.dataType) ||
                    isDateOrTimeType(column.dataType) ||
                    isEnumType(column.dataType) ||
                    isNumberType(column.dataType)))),
            ...(type === 'body' &&
              typeof column === 'object' &&
              !selected && {
                'text-emerald-700 dark:text-emerald-400':
                  !isNil(value) && isNumberType(column.dataType),
                'text-amber-700 dark:text-amber-400':
                  !isNil(value) && isDateOrTimeType(column.dataType),
                '!text-blue-700 dark:!text-blue-400': !isNil(value) && column.isPrimaryKey,
                '!text-sky-700 dark:!text-sky-400':
                  !isNil(value) && !column.isPrimaryKey && column.foreignKey !== null,
                '!text-indigo-700 dark:!text-indigo-400': !isNil(value) && column.isUnique,
                'text-teal-700 dark:text-teal-400': !isNil(value) && column.dataType === 'boolean',
                'text-fuchsia-700 dark:text-fuchsia-400':
                  !isNil(value) && isEnumType(column.dataType),
              }),
            'text-textTertiary':
              !selected && type === 'body' && (value === null || value === undefined),
          })}
        >
          {(() => {
            if (value === null) {
              return 'NULL';
            }
            if (value === undefined) {
              return 'EMPTY';
            }
            if (typeof column === 'object' && isDateTimeType(column.dataType)) {
              return value.replace('T', ' ');
            }
            return value;
          })()}
        </div>
        {type !== 'header' && typeof column === 'object' && column.foreignKey && !isNil(value) && (
          <Button
            color={selected ? 'white' : 'secondary'}
            htmlProps={{
              className: '-mr-1',
              onClick: openForeignTable,
            }}
            icon={<ArrowForward />}
            size="small"
          />
        )}
        {query.select && type === 'header' && (
          <>
            {!sorting.sortedColumn ||
            !isSortedColumn ||
            sorting.sortedColumn.direction === 'ASC' ? (
              <ArrowDownward
                className={classNames('!h-4 !w-4 text-primary', {
                  '!hidden opacity-0 group-hover:!block group-hover:opacity-50': !isSortedColumn,
                })}
              />
            ) : (
              <ArrowUpward className="!h-4 !w-4 text-primary group-hover:!block" />
            )}
          </>
        )}
      </div>
      {columnIndex === visibleColumnCount - 1 && (
        <div
          className={classNames(
            'h-8 w-full border-y border-y-border shadow-[inset_1px_0_0_0_#e5e5e5] dark:shadow-[inset_1px_0_0_0_#404040]',
            {
              'z-10 -ml-px bg-card': type === 'header',
              '-ml-px -mt-px': type === 'body',
            },
          )}
        />
      )}
    </>
  );
};
