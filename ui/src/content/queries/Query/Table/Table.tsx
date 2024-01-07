import React from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../types';

export type TableProps = {
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const {
    query: { columns, hasResults, rows },
  } = props;

  if (!hasResults) return null;

  return (
    <div className="grid justify-start overflow-hidden p-2 pt-0">
      <div
        className="grid overflow-auto"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((column) => (
          <Cell header key={column} value={column} />
        ))}
        {rows.map((row) =>
          columns.map((column) => {
            const value = row[column];

            return <Cell key={[row, column].join()} value={value} />;
          }),
        )}
      </div>
      {rows.length === 0 && (
        <div className="sticky left-0 w-full py-4 text-center text-xs text-gray-500">
          This table is empty.
        </div>
      )}
    </div>
  );
};
