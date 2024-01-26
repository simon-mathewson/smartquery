import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDebouncedCallback } from 'use-debounce';
import { popoverMargin } from './constants';

export type SelectionActionsProps = {
  columnCount: number;
  selection: number[][];
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions: React.FC<SelectionActionsProps> = (props) => {
  const { columnCount, selection, tableRef } = props;

  const [tableWidth, setTableWidth] = useState<number>();

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

    const { scrollLeft, scrollTop } = tableRef.current;

    return {
      bottom: bottom - tableRect.top + scrollTop,
      left: left - tableRect.left + scrollLeft,
      right: right - tableRect.left + scrollLeft,
      top: top - tableRect.top + scrollTop,
    };
  }, [columnCount, selection, tableRef]);

  const [scrollLeft, setScrollLeft] = useState<number>();

  const handleScroll = useDebouncedCallback(() => {
    if (!tableRef.current) {
      setScrollLeft(undefined);
      return;
    }
    setScrollLeft(tableRef.current.scrollLeft);
  }, 10);

  useEffect(() => {
    const table = tableRef.current;

    if (!table) return;

    table.addEventListener('scroll', handleScroll);

    return () => {
      table.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, tableRef]);

  const popoverRect = useMemo(() => {
    if (!selectionRect || tableWidth === undefined) return null;

    const top = selectionRect.bottom + popoverMargin;
    const width = Math.min(selectionRect.right - selectionRect.left, tableWidth);
    const left = Math.min(selectionRect.left + (scrollLeft ?? 0), selectionRect.right - width);

    return { left, top, width };
  }, [scrollLeft, selectionRect, tableWidth]);

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

  if (!popoverRect) return null;

  return (
    <div
      className="ease-in-out-circ pointer-events-none absolute flex justify-center transition-all"
      style={{
        left: `${popoverRect.left}px`,
        top: `${popoverRect.top}px`,
        width: `${popoverRect.width}px`,
      }}
    >
      <div className="pointer-events-auto flex rounded-full border border-gray-200 bg-white shadow-lg">
        <Button icon={<EditOutlined />} />
        <Button icon={<DeleteOutlined />} />
      </div>
    </div>
  );
};
