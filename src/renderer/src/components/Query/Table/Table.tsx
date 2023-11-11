import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../../types';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';

export type TableProps = {
  query: QueryType;
};

export const Table: React.FC<TableProps> = (props) => {
  const { query } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!query.sql) return;

    window.query(query.sql).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
      setQueries((queries) => queries.map((q) => (q === query ? { ...q, hasResults: true } : q)));
    });
  }, [query.sql]);

  if (!columns.length) return null;

  return (
    <div
      className="relative grid min-w-[576px] overflow-auto p-2 pt-0"
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
