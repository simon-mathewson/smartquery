import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../../types';

export type TableProps = {
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const { query } = props;

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    window.query(query.sql).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
    });
  }, [query.sql]);

  return (
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
  );
};
