import React, { useRef, useState } from 'react';
import { Cell } from './Cell/Cell';
import type { Query as QueryType } from '../../../../../shared/types';
import { useCellSelection } from './useCellSelection';
import { SelectionActions } from './SelectionActions/SelectionActions';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import { getPrimaryKeys } from '../../utils';
import { TabsContext } from '~/content/tabs/Context';

export type TableProps = {
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const { query } = props;

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, selectionActionsRef, tableContentRef } = useCellSelection();

  const { getChange } = useDefinedContext(EditContext);

  const tableRef = useRef<HTMLDivElement | null>(null);

  if (!queryResult) return null;

  const { columns, rows } = queryResult;

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
              return <Cell column={column} header key={columnName} value={columnName} />;
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
                    })
                  : undefined;
                const changedValue = change?.type === 'update' ? change.value : undefined;
                const isDeleted = change?.type === 'delete';

                return (
                  <Cell
                    column={column}
                    key={[row, columnName].join()}
                    isChanged={changedValue !== undefined}
                    isDeleted={isDeleted}
                    rootProps={{
                      'data-cell-column': String(columnIndex),
                      'data-cell-row': String(rowIndex),
                      'data-cell-query': query.id,
                      onClick: (event) => handleCellClick(event, rowIndex, columnIndex),
                      onMouseEnter: () =>
                        document
                          .querySelectorAll(
                            `[data-cell-query="${query.id}"][data-cell-row="${rowIndex}"]`,
                          )
                          .forEach((el) => {
                            (el as HTMLElement).dataset.rowHover = 'true';
                          }),
                      onMouseLeave: () =>
                        document
                          .querySelectorAll(
                            `[data-cell-query="${query.id}"][data-cell-row="${rowIndex}"]`,
                          )
                          .forEach((el) => {
                            (el as HTMLElement).dataset.rowHover = 'false';
                          }),
                    }}
                    selected={
                      selection[rowIndex] &&
                      (selection[rowIndex].length === 0 ||
                        selection[rowIndex].includes(columnIndex))
                    }
                    value={changedValue === undefined ? value : changedValue}
                  />
                );
              });
            })}
          </div>
          {isEditable && (
            <SelectionActions
              columnCount={visibleColumns!.length}
              query={query}
              ref={selectionActionsRef}
              selection={selection}
              setIsEditing={setIsEditing}
              tableRef={tableRef}
            />
          )}
        </div>
        {rows.length === 0 && (
          <div className="sticky left-0 w-full py-4 pl-4 text-xs">This table is empty.</div>
        )}
      </div>
    </>
  );
};
