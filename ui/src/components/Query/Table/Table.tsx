import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';
import { Query as QueryType } from '../../../types';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { GlobalContext } from '~/contexts/GlobalContext';
import { trpc } from '~/main';

export type TableProps = {
  hasResults: boolean;
  query: QueryType;
  setHasResults: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Table: React.FC<TableProps> = (props) => {
  const { hasResults, query, setHasResults } = props;

  const { clientId } = useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!query.sql || !clientId) return;

    trpc.sendQuery.query([clientId, query.sql]).then(({ fields, rows }) => {
      setColumns(fields.map(({ name }) => name));
      setRows(rows);
      setHasResults(true);
    });
  }, [query.sql, clientId, setHasResults]);

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
