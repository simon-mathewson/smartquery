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

export type TableProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { query } = useDefinedContext(QueryContext);

  const { columns, rows, table, tableType } = useDefinedContext(ResultContext);

  const { createChanges, getChangeAtLocation } = useDefinedContext(EditContext);

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, selectionActionsRef, setSelection, tableContentRef } =
    useSelection();

  const rowsToCreate = useMemo(
    () =>
      createChanges.filter((change) => change.location.table === table).map((change) => change.row),
    [createChanges, table],
  );

  useCopyPaste(selection, rowsToCreate);

  const sorting = useSorting();

  const tableRef = useRef<HTMLDivElement | null>(null);

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
      }, 200);
    };
  }, [createChanges, handleRowCreationRef, query.id, rows.length, setSelection, table]);

  const visibleColumns = columns
    ? columns.filter(({ isVisible }) => isVisible)
    : Object.keys(rows[0] ?? {});
  const isEditable = columns
    ? getPrimaryKeys(columns, rows, 0) !== null || rowsToCreate.length > 0
    : false;

  const isTableEmpty = rows.length === 0 && rowsToCreate.length === 0;

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
            className="grid auto-rows-max"
            ref={tableContentRef}
            style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}
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
            {rows.map((row, rowIndex) => {
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
        </div>
        {isTableEmpty && (
          <div className="sticky left-0 w-full py-4 pl-2 text-xs">This table is empty.</div>
        )}
      </div>
    </>
  );
};
