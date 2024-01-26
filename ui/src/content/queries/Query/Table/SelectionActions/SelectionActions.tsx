import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { OverlayPortal } from '~/shared/components/OverlayPortal/OverlayPortal';

export type SelectionActionsProps = {
  columnCount: number;
  selection: number[][];
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions: React.FC<SelectionActionsProps> = (props) => {
  const { columnCount, selection, tableRef } = props;

  const rect = useMemo<{ left: number; top: number; width: number } | null>(() => {
    if (selection.length === 0 || !tableRef.current) return null;

    const selectionRect = (() => {
      const firstRow = selection.findIndex(Boolean);
      const lastRow = selection.length - [...selection].reverse().findIndex(Boolean) - 1;
      const firstColumn = selection.reduce<number>((min, row) => {
        if (!row) return min;

        return row.length === 0 ? 0 : Math.min(min, Math.min(...row));
      }, Infinity);
      const lastColumn = selection.reduce<number>((max, row) => {
        if (!row) return max;
        return row.length === 0 ? columnCount - 1 : Math.max(max, Math.max(...row));
      }, 0);

      const topLeftCellRect = tableRef.current
        .querySelector(`[data-cell-column="${firstColumn}"][data-cell-row="${firstRow}"]`)
        ?.getBoundingClientRect();
      const bottomRightCellRect = tableRef.current
        .querySelector(`[data-cell-column="${lastColumn}"][data-cell-row="${lastRow}"]`)
        ?.getBoundingClientRect();

      if (!topLeftCellRect || !bottomRightCellRect) return null;

      const { left, top } = topLeftCellRect;
      const { right, bottom } = bottomRightCellRect;

      return { bottom, left, right, top };
    })();

    if (!selectionRect) return null;

    return {
      left: selectionRect.left,
      top: selectionRect.bottom,
      width: selectionRect.right - selectionRect.left,
    };
  }, [columnCount, selection, tableRef]);

  if (!rect) return null;

  return (
    <OverlayPortal>
      <div
        className="ease-in-out-circ pointer-events-none absolute flex justify-center transition-all"
        style={{
          left: `${rect.left}px`,
          top: `${rect.top + 4}px`,
          width: `${rect.width}px`,
        }}
      >
        <div className="pointer-events-auto flex rounded-full border border-gray-200 bg-white shadow-sm">
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteOutlined />} />
        </div>
      </div>
    </OverlayPortal>
  );
};
