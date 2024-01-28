import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDebouncedCallback } from 'use-debounce';
import { popoverHeight, popoverMargin } from './constants';
import { EditOverlay } from '../EditOverlay/EditOverlay';
import { Query } from '~/content/queries/types';

export type SelectionActionsProps = {
  columnCount: number;
  query: Query;
  selection: number[][];
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions: React.FC<SelectionActionsProps> = (props) => {
  const { columnCount, query, selection, tableRef } = props;

  const [tableWidth, setTableWidth] = useState<number>();

  const [scrollLeft, setScrollLeft] = useState(0);

  const editButtonRef = useRef<HTMLButtonElement | null>(null);

  const getSelectionRect = useCallback(() => {
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

    return {
      bottom: bottomRightCell.offsetTop + bottomRightCell.offsetHeight,
      left: topLeftCell.offsetLeft,
      right: bottomRightCell.offsetLeft + bottomRightCell.offsetWidth,
      top: topLeftCell.offsetTop,
    };
  }, [columnCount, selection, tableRef]);

  const handleScroll = useDebouncedCallback(() => {
    if (!tableRef.current) {
      setScrollLeft(0);
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

  const popoverStyles = useMemo(() => {
    const selectionRect = getSelectionRect();

    if (!selectionRect || tableWidth === undefined || !tableRef.current) return null;

    const top = selectionRect.bottom + popoverMargin;
    const width = Math.min(selectionRect.right - selectionRect.left, tableWidth);

    return {
      left: `${Math.min(selectionRect.left + scrollLeft, selectionRect.right - width)}px`,
      position: 'absolute',
      top: `${top}px`,
      width: `${width}px`,
    } as const;
  }, [getSelectionRect, scrollLeft, tableRef, tableWidth]);

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

  const popoverRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {popoverStyles && (
        <div className="pointer-events-none absolute flex justify-center" style={popoverStyles}>
          <div
            className="pointer-events-auto flex rounded-full border border-gray-200 bg-white shadow-lg"
            ref={popoverRef}
          >
            <Button icon={<EditOutlined />} ref={editButtonRef} />
            <Button icon={<DeleteOutlined />} />
          </div>
        </div>
      )}
      <div style={{ height: `${popoverHeight + popoverMargin * 4}px` }} />
      <EditOverlay
        selectionActionsPopoverRef={popoverRef}
        query={query}
        selection={selection}
        editButtonRef={editButtonRef}
      />
    </>
  );
};
