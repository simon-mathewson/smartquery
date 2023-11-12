import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../../types';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';

export type TableProps = {
  onQuerySuccess?: () => void;
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const { onQuerySuccess, query } = props;

  const { sendQuery } = useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!query.sql) return;

    sendQuery?.(query.sql).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
      onQuerySuccess?.();
    });
  }, [query.sql]);

  if (!columns.length) return null;

  return (
    <div className="relative overflow-auto p-2 pt-0">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
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
