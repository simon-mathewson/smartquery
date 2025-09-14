import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange, DeleteChange, UpdateChange } from '~/content/edit/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getUniqueValues } from '../../utils/getUniqueValues';
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
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { ActiveConnectionContext } from '~/content/connections/activeConnection/Context';

export type TableProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ActiveConnectionContext);
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
    ? Boolean(getUniqueValues(columns, rows, 0)?.length) || rowsToCreate.length > 0
    : false;

  const isTableEmpty = rows.length === 0 && rowsToCreate.length === 0;

  const visibleColumnNamesKey = useMemo(
    () =>
      JSON.stringify(
        visibleColumns.map((column) => (typeof column === 'object' ? column.name : column)),
      ),
    [visibleColumns],
  );

  const isEmpty = rows.length === 0 && rowsToCreate.length === 0;

  const resizedColumnWidthsStorageKey = `Table.resizedColumnWidths.${activeConnection.id}.${
    activeConnection.database
  }${'schema' in activeConnection ? `.${activeConnection.schema}` : ''}.${table}`;

  const [resizedColumnWidths, setResizedColumnWidths] = useStoredState<Record<string, number>>(
    resizedColumnWidthsStorageKey,
    {},
  );

  const [columnWidths, setColumnWidths] = useState<string[] | null>(null);

  // Compute column width based on median value length
  useEffect(() => {
    setColumnWidths(
      visibleColumns.map((column) => {
        if (isEmpty) return '1fr';

        const columnName = typeof column === 'object' ? column.name : column;

        const resizedColumnWidth = resizedColumnWidths[columnName];
        if (resizedColumnWidth) return `${resizedColumnWidth}px`;

        const sampleSize = Math.max(rows.length + rowsToCreate.length, 1000);
        const sample = [...rows, ...rowsToCreate]
          .sort(() => Math.random() - 0.5)
          .slice(0, sampleSize);
        const lengths = [columnName.length, ...sample.map((row) => String(row[columnName]).length)];
        const medianLength = median(lengths);
        const finalWidthChars = Math.max(Math.min(medianLength, 60), 10);
        const finalWidth = finalWidthChars * 9;

        return `${finalWidth}px`;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumnNamesKey, isEmpty, resizedColumnWidths]);

  const { topRowsHiddenCount, visibleRowCount, bottomRowsHiddenCount } = useVirtualization(
    rows,
    tableRef,
  );

  const getColumnWidthUpdater = (width: number, columnName: string) =>
    setResizedColumnWidths(() => ({
      ...resizedColumnWidths,
      [columnName]: width,
    }));

  return (
    <>
      <div className="relative flex min-h-[100px] grow flex-col items-start overflow-hidden">
        <div
          className={classNames('relative w-full overflow-auto', {
            'pointer-events-none overflow-hidden': isEditing,
          })}
          ref={tableRef}
        >
          <div
            className="sticky top-0 z-30 grid auto-rows-max"
            ref={tableContentRef}
            style={{ gridTemplateColumns: `${columnWidths?.join(' ') ?? '1fr'} 1fr` }}
          >
            {visibleColumns.map((column, columnIndex) => {
              const columnName = typeof column === 'object' ? column.name : column;

              return (
                <Cell
                  column={column}
                  columnIndex={columnIndex}
                  key={columnName}
                  setColumnWidth={(updateFn) => getColumnWidthUpdater(updateFn, columnName)}
                  sorting={sorting}
                  type="header"
                  value={columnName}
                  visibleColumnCount={visibleColumns.length}
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
            style={{ gridTemplateColumns: `${columnWidths?.join(' ') ?? '1fr'} 1fr` }}
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
                      uniqueValues: getUniqueValues(columns!, rows, rowIndex)!,
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
                    rowCount={rows.length + rowsToCreate.length}
                    rowIndex={rowIndex}
                    selection={selection}
                    setColumnWidth={(updateFn) => getColumnWidthUpdater(updateFn, columnName)}
                    type="body"
                    value={changedValue === undefined ? value : changedValue}
                    visibleColumnCount={visibleColumns.length}
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
                    rowCount={rows.length + rowsToCreate.length}
                    rowIndex={rows.length + rowIndex}
                    selection={selection}
                    setColumnWidth={(updateFn) => getColumnWidthUpdater(updateFn, columnName)}
                    type="body"
                    value={value}
                    visibleColumnCount={visibleColumns.length}
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
