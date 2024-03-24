import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditContext } from '~/content/edit/Context';
import type { CreateChange } from '~/content/edit/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { getPrimaryKeys } from '../../utils';
import { Cell } from './Cell/Cell';
import { SelectionActions } from './SelectionActions/SelectionActions';
import { useCellSelection } from './useCellSelection';
import { QueryContext, ResultContext } from '../Context';

export type TableProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { query } = useDefinedContext(QueryContext);

  const { columns, rows } = useDefinedContext(ResultContext);

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, selectionActionsRef, setSelection, tableContentRef } =
    useCellSelection();

  const { changes, getChange } = useDefinedContext(EditContext);

  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleRowCreationRef.current = () => {
      const latestCreateChange = changes.reduce<CreateChange | null>((latestChange, change) => {
        if (
          change.type === 'create' &&
          change.location.table === query.table &&
          (!latestChange ||
            Number(change.location.newRowId) > Number(latestChange.location.newRowId))
        ) {
          return change;
        }
        return latestChange;
      }, null);

      if (!latestCreateChange) return;

      const rowIndex = rows.length + Number(latestCreateChange.location.newRowId);

      const newSelection: number[][] = [];
      newSelection[rowIndex] = [];
      setSelection(newSelection);

      document
        .querySelector<HTMLDivElement>(
          `div[data-cell-column="0"][data-cell-row="${rowIndex}"][data-cell-query="${query.id}"]`,
        )
        ?.scrollIntoView({
          behavior: 'instant',
        });

      setTimeout(() => {
        console.log(document.querySelector<HTMLButtonElement>('.edit-button'));
        document.querySelector<HTMLButtonElement>('.edit-button')?.click();
      }, 200);
    };
  }, [changes, handleRowCreationRef, query.id, query.table, rows.length, setSelection]);

  const rowsToCreate = useMemo(
    () =>
      changes
        .filter(
          (change): change is CreateChange =>
            change.type === 'create' && change.location.table === query.table,
        )
        .map((change) => change.row),
    [changes, query.table],
  );

  const visibleColumns = columns
    ? columns.filter(({ isVisible }) => isVisible)
    : Object.keys(rows[0] ?? {});
  const isEditable = columns ? getPrimaryKeys(columns, rows, 0) !== null : false;

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
              const columnName = typeof column === 'object' ? column.alias ?? column.name : column;
              return <Cell column={column} key={columnName} type="header" value={columnName} />;
            })}
            {rows.map((row, rowIndex) => {
              return visibleColumns.map((column, columnIndex) => {
                const columnName =
                  typeof column === 'object' ? column.alias ?? column.name : column;
                const value = row[columnName];
                const change = isEditable
                  ? getChange({
                      column: columnName,
                      originalValue: value,
                      primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
                      table: query.table!,
                      type: 'update',
                    })
                  : undefined;

                const changedValue = change?.type === 'update' ? change.value : undefined;
                const isDeleted = change?.type === 'delete';

                return (
                  <Cell
                    column={column}
                    columnIndex={columnIndex}
                    isChanged={changedValue !== undefined}
                    isDeleted={isDeleted}
                    key={[row, columnName].join()}
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
                const columnName =
                  typeof column === 'object' ? column.alias ?? column.name : column;
                const value = row[columnName];

                return (
                  <Cell
                    column={column}
                    columnIndex={columnIndex}
                    isCreated
                    key={[row, columnName].join()}
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
          {isEditable && (
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
        {rows.length === 0 && rowsToCreate.length === 0 && (
          <div className="sticky left-0 w-full py-4 pl-4 text-xs">This table is empty.</div>
        )}
      </div>
    </>
  );
};
