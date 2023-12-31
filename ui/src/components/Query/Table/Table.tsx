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

  const { clientId, connections, selectedConnectionIndex, selectedDatabase } =
    useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const connection =
      selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

    if (!query.sql || !clientId || !connection) return;

    const table = query.sql.match(/\sfrom\s*[\s"']([^,;"'\s]+)/i)?.[1];

    if (!table) throw new Error('Could not find table name in query');

    const columnsQuery =
      connection.engine === 'mysql'
        ? `SELECT column_name AS c FROM information_schema.columns WHERE table_name = '${table}' AND table_schema = '${selectedDatabase}'`
        : `SELECT column_name AS c FROM information_schema.columns WHERE table_name = '${table}' AND table_catalog = '${selectedDatabase}'`;

    Promise.all([
      trpc.sendQuery.query([clientId, columnsQuery]),
      trpc.sendQuery.query([clientId, query.sql]),
    ]).then(([columns, rows]) => {
      setColumns(columns.map(({ c }) => c as string));
      setRows(rows);
      setHasResults(true);
    });
  }, [query.sql, clientId, setHasResults, selectedConnectionIndex, connections, selectedDatabase]);

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
