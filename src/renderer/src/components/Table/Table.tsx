import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Cell } from './Cell/Cell';

export const Table: React.FC = () => {
  const { selectedTable } = useDefinedContext(GlobalContext);

  const [rows, setRows] = useState<Record<string, string | Date>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedTable) return;

    window.query(`SELECT * FROM "${selectedTable}" LIMIT 50`).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
    });
  }, [selectedTable]);

  if (!selectedTable) return null;

  return (
    <div className="grid h-max max-h-full grid-rows-[max-content_1fr] gap-4 rounded-xl p-4 shadow-xl">
      <div className="text-center text-lg font-medium text-gray-800">{selectedTable}</div>
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
    </div>
  );
};
