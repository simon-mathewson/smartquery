import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../../types';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';

export type TableProps = {
  hasResults: boolean;
  query: QueryType;
  setHasResults: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { hasResults, query, setHasResults } = props;

  const { sendQuery } = useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!query.sql) return;

    sendQuery?.(query.sql).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
      setHasResults(true);
    });
  }, [query.sql]);

  if (!hasResults) return null;

  return (
    <div className="grid overflow-hidden p-2 pt-0">
      <div
        className="grid overflow-auto"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((column) => (
          <Cell header key={column}>
            {column}
          </Cell>
        ))}
        {rows.map((row) =>
          columns.map((column) => {
            const value = row[column];

            return (
              <Cell key={[row, column].join()}>
                {value instanceof Date ? value.toDateString() : value}
              </Cell>
            );
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
