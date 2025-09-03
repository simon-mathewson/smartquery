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

export type CellProps = {
  column: Column | string;
  value: Value | CreateValue;
  setColumnWidth: ResizeHandleProps['onResize'];
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
    setColumnWidth,
    sorting,
    type,
    value,
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
        from: [{ db: foreignKey.schema, table: foreignKey.table }],
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
        groupby: null,
        having: null,
        orderby: null,
        limit: null,
      },
      activeConnection.engine,
    );

    void addQuery({ sql, initialInputMode: 'filters' }, { afterActiveTab: true });
  }, [activeConnection.engine, addQuery, column, value]);

  return (
    <div
      tabIndex={-1}
      className={classNames(
        'group relative flex h-8 select-none items-center justify-between gap-2 px-2 transition-colors duration-100',
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
          'h-10 border-b bg-card': type === 'header',
          'cursor-pointer': type === 'header' && query.select,
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
              void sorting.toggleSort((column as Column).name);
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
                  column.isPrimaryKey ||
                  ['boolean', 'json'].includes(column.dataType) ||
                  isDateOrTimeType(column.dataType) ||
                  isEnumType(column.dataType) ||
                  isNumberType(column.dataType)))),
          ...(type === 'body' &&
            typeof column === 'object' &&
            !selected && {
              'text-emerald-600 dark:text-emerald-500':
                !isNil(value) && isNumberType(column.dataType),
              'text-amber-600 dark:text-amber-500':
                !isNil(value) && isDateOrTimeType(column.dataType),
              '!text-blue-600 dark:!text-blue-500': !isNil(value) && column.isPrimaryKey,
              '!text-sky-600 dark:!text-sky-500':
                !isNil(value) && !column.isPrimaryKey && column.foreignKey !== null,
              '!text-indigo-600 dark:!text-indigo-500': !isNil(value) && column.isUnique,
              'text-teal-600 dark:text-teal-500': !isNil(value) && column.dataType === 'boolean',
              'text-fuchsia-600 dark:text-fuchsia-500':
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
      {type !== 'header' && typeof column === 'object' && column.foreignKey && (
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
          sorting.sortedColumn.columnName !== (column as Column).name ||
          sorting.sortedColumn.direction === 'ASC' ? (
            <ArrowDownward
              className={classNames('!h-4 !w-4 text-primary', {
                '!hidden opacity-0 group-hover:!block group-hover:opacity-50':
                  sorting.sortedColumn?.columnName !== (column as Column).name,
              })}
            />
          ) : (
            <ArrowUpward className="!h-4 !w-4 text-primary group-hover:!block" />
          )}
        </>
      )}
    </div>
  );
};
