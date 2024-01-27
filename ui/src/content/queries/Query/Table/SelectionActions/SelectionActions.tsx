import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDebouncedCallback } from 'use-debounce';
import { popoverHeight, popoverMargin } from './constants';
import classNames from 'classnames';

export type SelectionActionsProps = {
  columnCount: number;
  selection: number[][];
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions: React.FC<SelectionActionsProps> = (props) => {
  const { columnCount, selection, tableRef } = props;

  const [tableWidth, setTableWidth] = useState<number>();

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const selectionRect = useMemo(() => {
    if (selection.length === 0 || !tableRef.current) return null;

    const firstRow = selection.findIndex(Boolean);
    const lastRow = selection.reduce((lastIndex, row, rowIndex) => (row ? rowIndex : lastIndex), 0);
    const firstColumn = selection.reduce<number>((min, row) => {
      if (!row) return min;

      return row.length === 0 ? 0 : Math.min(min, Math.min(...row));
    }, Infinity);
    const lastColumn = selection.reduce<number>((max, row) => {
      if (!row) return max;
      return row.length === 0 ? columnCount - 1 : Math.max(max, Math.max(...row));
    }, 0);

    const topLeftCell = tableRef.current.querySelector<HTMLDivElement>(
      `[data-cell-column="${firstColumn}"][data-cell-row="${firstRow}"]`,
    );
    const bottomRightCell = tableRef.current.querySelector<HTMLDivElement>(
      `[data-cell-column="${lastColumn}"][data-cell-row="${lastRow}"]`,
    );

    if (!topLeftCell || !bottomRightCell) return null;

    const { left, top } = topLeftCell.getBoundingClientRect();
    const { bottom, right } = bottomRightCell.getBoundingClientRect();
    const tableRect = tableRef.current.getBoundingClientRect();

    return {
      viewport: {
        bottom,
        left,
        right,
        top,
      },
      table: {
        bottom: bottom - tableRect.top + scrollTop,
        left: left - tableRect.left + scrollLeft,
        right: right - tableRect.left + scrollLeft,
        top: top - tableRect.top + scrollTop,
      },
    };
  }, [columnCount, selection, tableRef, scrollLeft, scrollTop]);

  const handleScroll = useDebouncedCallback(() => {
    if (!tableRef.current) {
      setScrollLeft(0);
      setScrollTop(0);
      return;
    }
    setScrollLeft(tableRef.current.scrollLeft);
    setScrollTop(tableRef.current.scrollTop);
  }, 10);

  useEffect(() => {
    const table = tableRef.current;

    if (!table) return;

    table.addEventListener('scroll', handleScroll);

    return () => {
      table.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, tableRef]);

  const popoverStyles = useMemo(() => {
    if (!selectionRect || tableWidth === undefined || !tableRef.current) return null;

    const tableRect = tableRef.current.getBoundingClientRect();

    const minTop = selectionRect.table.top + popoverHeight + popoverMargin * 2;
    const maxTop = selectionRect.table.bottom + popoverHeight + popoverMargin * 2;
    const bottomBoundary = tableRef.current.offsetHeight + scrollTop;

    if (bottomBoundary > minTop && bottomBoundary < maxTop) {
      return {
        bottom: `${window.innerHeight - tableRect.bottom + popoverMargin}px`,
        position: 'fixed',
        left: `${selectionRect.viewport.left + scrollLeft}px`,
        width: `${Math.min(
          selectionRect.viewport.right - selectionRect.viewport.left,
          tableRect.width,
        )}px`,
      } as const;
    }

    const top =
      bottomBoundary < maxTop
        ? selectionRect.table.top + popoverMargin
        : selectionRect.table.bottom + popoverMargin;
    const width = Math.min(selectionRect.table.right - selectionRect.table.left, tableWidth);
    const left = Math.min(
      selectionRect.table.left + (scrollLeft ?? 0),
      selectionRect.table.right - width,
    );

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
    } as const;
  }, [scrollLeft, scrollTop, selectionRect, tableRef, tableWidth]);

  const handleTableResize = useDebouncedCallback((entries: ResizeObserverEntry[]) => {
    const { width } = entries[0].contentRect;
    setTableWidth(width);
  }, 10);

  useEffect(() => {
    if (!tableRef.current) {
      setTableWidth(undefined);
      return;
    }

    const resizeObserver = new ResizeObserver(handleTableResize);
    resizeObserver.observe(tableRef.current);
  }, [handleTableResize, tableRef]);

  const [isClickable, setIsClickable] = useState(false);

  const isClickableTimeoutIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    setIsClickable(false);

    if (isClickableTimeoutIdRef.current !== null) {
      clearTimeout(isClickableTimeoutIdRef.current);
    }

    isClickableTimeoutIdRef.current = window.setTimeout(() => {
      setIsClickable(true);
    }, 300);
  }, [popoverStyles]);

  return (
    <>
      {popoverStyles && (
        <div className="pointer-events-none absolute flex justify-center" style={popoverStyles}>
          <div
            className={classNames('flex rounded-full border border-gray-200 bg-white shadow-lg', {
              'pointer-events-auto': isClickable,
            })}
          >
            <Button icon={<EditOutlined />} />
            <Button icon={<DeleteOutlined />} />
          </div>
        </div>
      )}
      <div style={{ height: `${popoverHeight + popoverMargin * 4}px` }} />
    </>
  );
};
