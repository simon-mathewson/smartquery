import { range } from 'lodash';
import { EditOutlined, Undo } from '@mui/icons-material';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useDebouncedCallback } from 'use-debounce';
import { popoverHeight, popoverMargin } from './constants';
import { EditOverlay } from '../EditOverlay/EditOverlay';
import type { Query } from '~/shared/types';
import { mergeRefs } from 'react-merge-refs';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';
import { Delete } from './Delete/Delete';
import { EditContext } from '~/content/edit/Context';
import type { PrimaryKey } from '~/content/edit/types';
import { getPrimaryKeys } from '../../../utils';
import { doChangeLocationsMatch } from '~/content/edit/utils';

export type SelectionActionsProps = {
  columnCount: number;
  query: Query;
  selection: number[][];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  tableRef: React.MutableRefObject<HTMLDivElement | null>;
};

export const SelectionActions = forwardRef<HTMLDivElement, SelectionActionsProps>((props, ref) => {
  const { columnCount, query, selection, setIsEditing, tableRef } = props;

  const { changes, removeChange } = useDefinedContext(EditContext);

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

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

  const { isEntireSelectionDeleted, selectedChanges } = useMemo(() => {
    if (!queryResult)
      return {
        isEntireSelectionDeleted: false,
        selectedChanges: [],
      };

    const selectionLocations = selection.reduce<
      Array<{ column: string; primaryKeys: PrimaryKey[]; table: string }>
    >((locations, _selectedColumnIndices, rowIndex) => {
      const selectedColumnIndices =
        _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

      return [
        ...locations,
        ...selectedColumnIndices.map((columnIndex) => {
          return {
            column: queryResult.columns![columnIndex].name,
            primaryKeys: getPrimaryKeys(queryResult.columns!, queryResult.rows, rowIndex),
            table: query.table!,
          };
        }),
      ];
    }, []);

    const selectedChanges = changes.filter((change) => {
      return selectionLocations.some((location) => {
        return doChangeLocationsMatch(location, change.location);
      });
    });

    const isEntireSelectionDeleted = selectionLocations.every((location) => {
      return selectedChanges.some((change) => {
        return change.type === 'delete' && doChangeLocationsMatch(location, change.location);
      });
    });

    return { isEntireSelectionDeleted, selectedChanges };
  }, [changes, columnCount, query.table, queryResult, selection]);

  return (
    <>
      {popoverStyles && (
        <div
          className="pointer-events-none absolute z-20 flex justify-center"
          style={popoverStyles}
        >
          <div
            className="pointer-events-auto flex items-center rounded-full border border-border bg-card shadow-lg"
            ref={mergeRefs([popoverRef, ref])}
          >
            <Button icon={<EditOutlined />} ref={editButtonRef} />
            {!isEntireSelectionDeleted && selection.every((row) => row.length === 0) && (
              <Delete query={query} selection={selection} />
            )}
            {selectedChanges.length > 0 && (
              <Button
                color="secondary"
                icon={<Undo />}
                onClick={() => {
                  selectedChanges.forEach((change) => {
                    removeChange(change.location);
                  });
                }}
              />
            )}
          </div>
        </div>
      )}
      {Boolean(queryResult?.rows.length) && (
        <div style={{ height: `${popoverHeight + popoverMargin * 4}px` }} />
      )}
      <EditOverlay
        columnCount={columnCount}
        editButtonRef={editButtonRef}
        query={query}
        selection={selection}
        selectionActionsPopoverRef={popoverRef}
        setIsEditing={setIsEditing}
      />
    </>
  );
});
