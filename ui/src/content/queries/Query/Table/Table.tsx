import React, { useState } from 'react';
import { Cell } from './Cell/Cell';
import type { Query as QueryType } from '../../types';
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
    query: { columns, hasResults, rows },
  } = props;

  const [hoverRowIndex, setHoverRowIndex] = useState<number>();

  const [isEditing, setIsEditing] = useState(false);

  const { handleCellClick, selection, tableRef } = useCellSelection();

  const { getChangedValue } = useDefinedContext(EditContext);

  if (!hasResults) return null;

  return (
    <>
      <div className="relative grid justify-start overflow-hidden p-2 pt-0">
        <div
          className={classNames('height-full relative grid auto-rows-max overflow-auto', {
            'pointer-events-none overflow-hidden': isEditing,
          })}
          ref={tableRef}
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((column) => (
            <Cell column={column} header key={column.name} value={column.name} />
          ))}
          {rows.map((row, rowIndex) =>
            columns.map((column, columnIndex) => {
              const value = row[column.name];
              const changedValue = query.table
                ? getChangedValue({
                    column: column.name,
                    row: { primaryKeys: getPrimaryKeys(query, rowIndex), value },
                    table: query.table,
                  })
                : undefined;

              return (
                <Cell
                  column={column}
                  key={[row, column.name].join()}
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
                    (selection[rowIndex].length === 0 || selection[rowIndex].includes(columnIndex))
                  }
                  value={changedValue === undefined ? value : changedValue}
                />
              );
            }),
          )}
          <SelectionActions
            columnCount={columns.length}
            query={query}
            selection={selection}
            setIsEditing={setIsEditing}
            tableRef={tableRef}
          />
        </div>
        {rows.length === 0 && (
          <div className="sticky left-0 w-full py-4 text-center text-xs text-gray-500">
            This table is empty.
          </div>
        )}
      </div>
    </>
  );
};
