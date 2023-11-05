import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Select } from '../shared/Select/Select';

export const TableList: React.FC = () => {
  const { connections, selectedTable, setSelectedTable } = useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(
    connections[0]?.database ?? null,
  );

  useEffect(() => {
    if (!selectedDatabase) return;

    window.connectToDatabase(selectedDatabase).then(() => {
      window
        .query(
          `SELECT * FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${selectedDatabase}'
        ORDER BY table_name ASC`,
        )
        .then((data) => {
          setTables(data.rows.map(({ table_name }) => table_name));

          window
            .query(
              `SELECT datname FROM pg_database WHERE datistemplate = FALSE ORDER BY datname ASC`,
            )
            .then((data) => {
              setDatabases(data.rows.map(({ datname }) => datname));
            });
        });
    });
  }, [selectedDatabase]);

  return (
    <div className="sticky left-0 top-0 z-10 grid w-56 flex-shrink-0 grid-rows-[max-content_1fr] shadow-xl">
      <div className="overflow-hidden border-b-[1px] border-b-gray-200 p-2">
        <Select
          onChange={setSelectedDatabase}
          options={databases.map((database) => ({
            label: database,
            value: database,
          }))}
          value={selectedDatabase}
        />
      </div>
      <div className="overflow-auto p-2">
        {tables.map((tableName) => (
          <div
            className={classNames(
              'cursor-pointer rounded-md px-2 py-1.5 text-xs font-medium text-gray-600',
              {
                'bg-blue-500': tableName === selectedTable,
                'text-white': tableName === selectedTable,
                'hover:bg-gray-200': tableName !== selectedTable,
              },
            )}
            key={tableName}
            onClick={() => setSelectedTable(tableName)}
          >
            {tableName}
          </div>
        ))}
      </div>
    </div>
  );
};
