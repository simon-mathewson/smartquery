import { EditOutlined, Undo } from '@mui/icons-material';
import { range } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import type { XOR } from 'ts-essentials';
import { useDebouncedCallback } from 'use-debounce';
import { EditContext } from '~/content/edit/Context';
import type { UniqueValue } from '~/content/edit/types';
import { doChangeLocationsMatch } from '~/content/edit/utils';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getUniqueValues } from '../../../utils/getUniqueValues';
import { ResultContext } from '../../Context';
import { EditOverlay } from '../editOverlay/EditOverlay';
import { Delete } from './delete/Delete';
import { popoverHeight, popoverMargin } from './constants';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays/arrays';
import { AnalyticsContext } from '~/content/analytics/Context';
import { isNotNull } from '~/shared/utils/typescript/typescript';

export type SelectionActionsProps = {
  columnCount: number;
  isEditing: boolean;
  selection: number[][];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelection: React.Dispatch<React.SetStateAction<number[][]>>;
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions = forwardRef<HTMLDivElement, SelectionActionsProps>((props, ref) => {
  const { columnCount, selection, setIsEditing, setSelection, tableRef } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { allChanges, removeChange } = useDefinedContext(EditContext);

  const { columns, rows, tables } = useDefinedContext(ResultContext);

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

    // Find the top left and bottom right cells of the selection. Fall back to first and last visible
    // cells of the column in case selection corners were unmounted by virtualization.
    const topLeftCell =
      tableRef.current.querySelector<HTMLDivElement>(
        `[data-cell-column="${firstColumn}"][data-cell-row="${firstRow}"]`,
      ) ??
      tableRef.current.querySelectorAll<HTMLDivElement>(`[data-cell-column="${firstColumn}"]`)[0];
    const bottomRightCell =
      tableRef.current.querySelector<HTMLDivElement>(
        `[data-cell-column="${lastColumn}"][data-cell-row="${lastRow}"]`,
      ) ??
      Array.from(
        tableRef.current.querySelectorAll<HTMLDivElement>(`[data-cell-column="${lastColumn}"]`),
      ).slice(-1)[0];

    if (!topLeftCell || !bottomRightCell) return null;

    return {
      bottom: bottomRightCell.offsetTop + bottomRightCell.offsetHeight,
      left: topLeftCell.offsetLeft,
      right: bottomRightCell.offsetLeft + bottomRightCell.offsetWidth,
      top: topLeftCell.offsetTop,
    };
  }, [columnCount, selection, tableRef]);

  const handleScroll = useCallback(() => {
    if (!tableRef.current) {
      setScrollLeft(0);
      return;
    }
    setScrollLeft(tableRef.current.scrollLeft);
  }, [tableRef]);

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

  const { isSelectionEditable, isEntireSelectionDeleted, selectedChanges } = useMemo(() => {
    const selectionLocations = selection.reduce<
      Array<
        { column: string; table: string } & XOR<{ uniqueValues: UniqueValue[] }, { index: number }>
      >
    >((allLocations, _selectedColumnIndices, rowIndex) => {
      const selectedColumnIndices =
        _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

      const rowLocations = selectedColumnIndices
        .map((columnIndex) => {
          const column = columns!
            .filter(({ isVisible, isVirtual }) => isVisible && !isVirtual)
            .at(columnIndex)?.originalName;

          if (!column) return null;

          return rowIndex < rows.length
            ? {
                column,
                uniqueValues: getUniqueValues(columns!, rows[rowIndex])!,
                table: tables[0].originalName,
              }
            : {
                column,
                index: rowIndex - rows.length,
                table: tables[0].originalName,
              };
        })
        .filter(isNotNull);

      return [...allLocations, ...rowLocations];
    }, []);

    const selectedChanges = allChanges.filter((change) => {
      return selectionLocations.some((location) => {
        return doChangeLocationsMatch(location, change.location);
      });
    });

    const isEntireSelectionDeleted = selectionLocations.every((location) => {
      return selectedChanges.some((change) => {
        return change.type === 'delete' && doChangeLocationsMatch(location, change.location);
      });
    });

    const isSelectionEditable = selectionLocations.length > 0;

    return { isSelectionEditable, isEntireSelectionDeleted, selectedChanges };
  }, [allChanges, columnCount, columns, rows, selection, tables]);

  return (
    <>
      {popoverStyles && isSelectionEditable && (
        <div
          className="pointer-events-none absolute z-20 flex justify-center"
          style={popoverStyles}
        >
          <div
            className="pointer-events-auto flex items-center rounded-full border border-border bg-card shadow-lg"
            ref={mergeRefs([popoverRef, ref])}
          >
            <Button
              htmlProps={{
                className: 'edit-button',
                onClick: () => track('table_selection_edit'),
                ref: editButtonRef,
              }}
              icon={<EditOutlined />}
              tooltip="Edit"
            />
            {!isEntireSelectionDeleted &&
              selection.every((row) => row.length === 0) &&
              !selectedChanges.some((change) => change.type === 'create') && (
                <Delete selection={selection} />
              )}
            {selectedChanges.length > 0 && (
              <Button
                color="secondary"
                htmlProps={{
                  onClick: () => {
                    selectedChanges.forEach((change) => {
                      removeChange(change.location);
                    });

                    // Remove rows to be created from selection
                    setSelection((currentSelection) => {
                      const newSelection = cloneArrayWithEmptyValues(currentSelection);
                      currentSelection.forEach((_, rowIndex) => {
                        if (rowIndex >= rows.length) {
                          delete newSelection[rowIndex];
                        }
                      });
                      return newSelection;
                    });

                    track('table_selection_undo');
                  },
                }}
                icon={<Undo />}
                tooltip="Undo"
              />
            )}
          </div>
        </div>
      )}
      <div style={{ height: `${popoverHeight + popoverMargin * 3}px` }} />
      <EditOverlay
        columnCount={columnCount}
        editButtonRef={editButtonRef}
        selection={selection}
        selectionActionsPopoverRef={popoverRef}
        setIsEditing={setIsEditing}
      />
    </>
  );
});
