import React, { useState } from 'react';
import { Cell } from './Cell/Cell';
import type { Column, Query as QueryType } from '../../types';
import { useCellSelection } from './useCellSelection';
import { SelectionActions } from './SelectionActions/SelectionActions';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { EditContext } from '~/content/edit/Context';
import { getPrimaryKeys } from '../../utils';

export type TableProps = {
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const {
    query,
    query: { columns: columnsProp, hasResults, rows },
  } = props;

  const columns = columnsProp ?? Object.keys(rows[0] ?? {});

  const [hoverRowIndex, setHoverRowIndex] = useState<number>();

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, selectionActionsRef, tableContentRef } = useCellSelection();

  const { getChangedValue } = useDefinedContext(EditContext);

  if (!hasResults) return null;

  return (
    <>
      <div className="relative grid justify-start overflow-hidden p-2 pt-0">
        <div
          className={classNames('height-full relative overflow-auto', {
            'pointer-events-none overflow-hidden': isEditing,
          })}
        >
          <div
            className="grid auto-rows-max"
            ref={tableContentRef}
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((column) => {
              const columnName = typeof column === 'object' ? column.name : column;
              return <Cell column={column} header key={columnName} value={columnName} />;
            })}
            {rows.map((row, rowIndex) =>
              columns.map((column, columnIndex) => {
                const columnName = typeof column === 'object' ? column.name : column;
                const value = row[columnName];
                const changedValue =
                  query.table && typeof column === 'object'
                    ? getChangedValue({
                        column: columnName,
                        row: {
                          primaryKeys: getPrimaryKeys(columns as Column[], rows, rowIndex),
                          value,
                        },
                        table: query.table,
                      })
                    : undefined;

                return (
                  <Cell
                    column={column}
                    key={[row, columnName].join()}
                    hover={rowIndex === hoverRowIndex}
                    isChanged={changedValue !== undefined}
                    rootProps={{
                      'data-cell-column': String(columnIndex),
                      'data-cell-row': String(rowIndex),
                      onClick: (event) => handleCellClick(event, rowIndex, columnIndex),
                      onMouseEnter: () => setHoverRowIndex(rowIndex),
                      onMouseLeave: () => setHoverRowIndex(undefined),
                    }}
                    selected={
                      selection[rowIndex] &&
                      (selection[rowIndex].length === 0 ||
                        selection[rowIndex].includes(columnIndex))
                    }
                    value={changedValue === undefined ? value : changedValue}
                  />
                );
              }),
            )}
          </div>
          <SelectionActions
            columnCount={columns.length}
            query={query}
            ref={selectionActionsRef}
            selection={selection}
            setIsEditing={setIsEditing}
            tableRef={tableContentRef}
          />
        </div>
        {rows.length === 0 && (
          <div className="sticky left-0 w-full py-4 text-center text-xs">This table is empty.</div>
        )}
      </div>
    </>
  );
};
