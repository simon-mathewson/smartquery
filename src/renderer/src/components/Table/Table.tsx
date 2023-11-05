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

    window.query(`SELECT * FROM "${selectedTable}"`).then((data) => {
      setColumns(data.fields.map(({ name }) => name));
      setRows(data.rows);
    });
  }, [selectedTable]);

  return (
    <div className="h-max max-h-full shadow-2xl rounded-xl p-4 grid gap-4 grid-rows-[max-content_1fr]">
      <div className="text-lg text-center font-medium text-gray-800">{selectedTable}</div>
      <div
        className="overflow-auto grid"
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
