import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange, DeleteChange, UpdateChange } from '~/content/edit/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getPrimaryKeys } from '../../utils/primaryKeys';
import { Cell } from './cell/Cell';
import { SelectionActions } from './selectionActions/SelectionActions';
import { useSelection } from './useSelection';
import { QueryContext, ResultContext } from '../Context';
import { useCopyPaste } from './copyPaste/useCopyPaste';
import { useSorting } from './sorting/useSorting';
import { AnalyticsContext } from '~/content/analytics/Context';
import { median } from '~/shared/utils/math/median';
import { useVirtualization } from './useVirtualization';
import { CELL_HEIGHT } from './cell/constants';

export type TableProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { query } = useDefinedContext(QueryContext);

  const { columns, rows, table, tableType } = useDefinedContext(ResultContext);

  const { createChanges, getChangeAtLocation } = useDefinedContext(EditContext);

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, selectionActionsRef, setSelection, tableRef } =
    useSelection();

  const rowsToCreate = useMemo(
    () =>
      createChanges.filter((change) => change.location.table === table).map((change) => change.row),
    [createChanges, table],
  );

  const tableContentRef = useRef<HTMLDivElement | null>(null);

  useCopyPaste(selection, rowsToCreate, tableRef);

  const sorting = useSorting();

  useEffect(() => {
    handleRowCreationRef.current = () => {
      const latestCreateChange = createChanges.reduce<CreateChange | null>(
        (latestChange, change) => {
          if (
            change.location.table === table &&
            (!latestChange || change.location.index > latestChange.location.index)
          ) {
            return change;
          }
          return latestChange;
        },
        null,
      );

      if (!latestCreateChange) return;

      const rowIndex = rows.length + latestCreateChange.location.index;

      const newSelection: number[][] = [];
      newSelection[rowIndex] = [];
      setSelection(newSelection);

      document
        .querySelector<HTMLDivElement>(
          `[data-query="${query.id}"] [data-cell-column="0"][data-cell-row="${rowIndex}"]`,
        )
        ?.scrollIntoView({
          behavior: 'instant',
        });

      setTimeout(() => {
        document
          .querySelector<HTMLButtonElement>(`[data-query="${query.id}"] .edit-button`)
          ?.click();

        track('query_create_row');
      }, 200);
    };
  }, [createChanges, handleRowCreationRef, query.id, rows.length, setSelection, table, track]);

  const visibleColumns = columns
    ? columns.filter(({ isVisible }) => isVisible)
    : Object.keys(rows[0] ?? {});
  const isEditable = columns
    ? getPrimaryKeys(columns, rows, 0) !== null || rowsToCreate.length > 0
    : false;

  const isTableEmpty = rows.length === 0 && rowsToCreate.length === 0;

  const [columnWidths, setColumnWidths] = useState<string[] | null>(null);

  const visibleColumnNamesKey = useMemo(
    () =>
      JSON.stringify(
        visibleColumns.map((column) => (typeof column === 'object' ? column.name : column)),
      ),
    [visibleColumns],
  );

  const isEmpty = rows.length === 0 && rowsToCreate.length === 0;

  // Compute column width based on median value length
  useEffect(() => {
    setColumnWidths(
      visibleColumns.map((column) => {
        if (isEmpty) return '1fr';

        const columnName = typeof column === 'object' ? column.name : column;

        const sampleSize = Math.max(rows.length + rowsToCreate.length, 1000);
        const sample = [...rows, ...rowsToCreate]
          .sort(() => Math.random() - 0.5)
          .slice(0, sampleSize);
        const medianLength = median(sample.map((row) => String(row[columnName]).length));
        const finalWidth = Math.max(Math.min(medianLength, 60), 10);

        return `${finalWidth}ch`;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumnNamesKey, isEmpty]);

  const { topRowsHiddenCount, visibleRowCount, bottomRowsHiddenCount } = useVirtualization(
    rows,
    tableRef,
  );

  return (
    <>
      <div className="relative flex grow flex-col items-start overflow-hidden px-2">
        <div
          className={classNames('relative max-w-full overflow-auto', {
            'pointer-events-none overflow-hidden': isEditing,
          })}
          ref={tableRef}
        >
          <div
            className="sticky top-0 z-30 grid auto-rows-max"
            ref={tableContentRef}
            style={{ gridTemplateColumns: columnWidths?.join(' ') ?? '1fr' }}
          >
            {visibleColumns.map((column) => {
              const columnName = typeof column === 'object' ? column.name : column;
              return (
                <Cell
                  column={column}
                  key={columnName}
                  sorting={sorting}
                  type="header"
                  value={columnName}
                />
              );
            })}
          </div>
          <div
            className="col-span-full h-0"
            style={{
              height: topRowsHiddenCount * CELL_HEIGHT,
            }}
          />
          <div
            className="grid auto-rows-max"
            ref={tableContentRef}
            style={{ gridTemplateColumns: columnWidths?.join(' ') ?? '1fr' }}
          >
            {rows.map((row, rowIndex) => {
              const rowNumber = rowIndex + 1;
              if (
                rowNumber <= topRowsHiddenCount ||
                rowNumber >= topRowsHiddenCount + visibleRowCount
              ) {
                return null;
              }

              return visibleColumns.map((column, columnIndex) => {
                const columnName = typeof column === 'object' ? column.name : column;
                const value = row[columnName];
                const change = isEditable
                  ? (getChangeAtLocation({
                      column: columnName,
                      originalValue: value,
                      primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
                      table: table!,
                      type: 'update',
                    }) as DeleteChange | UpdateChange | undefined)
                  : null;

                const changedValue = change?.type === 'update' ? change.value : undefined;
                const isDeleted = change?.type === 'delete';

                return (
                  <Cell
                    column={column}
                    columnIndex={columnIndex}
                    isChanged={changedValue !== undefined}
                    isDeleted={isDeleted}
                    key={[columnIndex, rowIndex].join()}
                    onClick={handleCellClick}
                    rowIndex={rowIndex}
                    selection={selection}
                    type="body"
                    value={changedValue === undefined ? value : changedValue}
                  />
                );
              });
            })}
            {rowsToCreate.map((row, rowIndex) => {
              const rowNumber = rowIndex + 1 + rows.length;
              if (
                rowNumber <= topRowsHiddenCount ||
                rowNumber >= topRowsHiddenCount + visibleRowCount
              ) {
                return null;
              }

              return visibleColumns.map((column, columnIndex) => {
                const columnName = typeof column === 'object' ? column.name : column;
                const value = row[columnName];

                return (
                  <Cell
                    column={column}
                    columnIndex={columnIndex}
                    isCreated
                    key={[columnIndex, rowIndex].join()}
                    onClick={handleCellClick}
                    rowIndex={rows.length + rowIndex}
                    selection={selection}
                    type="body"
                    value={value}
                  />
                );
              });
            })}
          </div>
          {isEditable && tableType === 'BASE TABLE' && (
            <SelectionActions
              columnCount={visibleColumns!.length}
              isEditing={isEditing}
              ref={selectionActionsRef}
              selection={selection}
              setIsEditing={setIsEditing}
              setSelection={setSelection}
              tableRef={tableRef}
            />
          )}
          <div
            className="col-span-full h-0"
            style={{
              height: bottomRowsHiddenCount * CELL_HEIGHT,
            }}
          />
        </div>
        {isTableEmpty && (
          <div className="sticky left-0 w-full py-4 pl-2 text-xs">This table is empty.</div>
        )}
      </div>
    </>
  );
};
