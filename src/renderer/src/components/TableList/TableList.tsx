import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Item } from './Item/Item';

export const TableList: React.FC = () => {
  const { selectedDatabase, sendQuery } = useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDatabase) return;

    sendQuery?.(
      `SELECT * FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${selectedDatabase}'
        ORDER BY table_name ASC`,
    ).then((data) => {
      setTables(data.rows.map(({ table_name }) => table_name));
    });
  }, [selectedDatabase, sendQuery]);

  return (
    <div className="overflow-auto py-2">
      {tables.length > 0 ? (
        tables.map((tableName) => <Item key={tableName} tableName={tableName} />)
      ) : (
        <div className="py-1 text-center text-xs text-gray-500">This database is empty.</div>
      )}
    </div>
  );
};
