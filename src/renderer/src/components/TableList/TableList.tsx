import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';

export const TableList: React.FC = () => {
  const { connections, selectedTable, setSelectedTable } = useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!connections[0]) return;

    window
      .query(
        `SELECT * FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_name ASC`,
      )
      .then((data) => {
        setTables(data.rows.map(({ table_name }) => table_name));
      });
  }, []);

  return (
    <div className="w-56 flex-0 bg-gray-50 grid grid-rows-[max-content_1fr]">
      <div className="border-b-[1px] border-b-gray-200 mb-1 cursor-pointer hover:bg-gray-200 flex items-center justify-between gap-2 font-medium text-gray-900 text-xs px-4 py-2">
        <div>{connections[0].database}</div>
        <ExpandMore className="text-gray-400" />
      </div>
      <div className="p-2 overflow-auto">
        {tables.map((tableName) => (
          <div
            className={classNames(
              'cursor-pointer font-medium rounded-md px-2 py-1.5 text-gray-600 text-xs',
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
