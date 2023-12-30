import { GlobalContext } from '~/contexts/GlobalContext';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Item } from './Item/Item';
import { trpc } from '~/main';

export const TableList: React.FC = () => {
  const { clientId, connections, selectedConnectionIndex, selectedDatabase } =
    useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    const connection =
      selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

    if (!selectedDatabase || !clientId || !connection) return;

    const tableNamesQuery =
      connection.engine === 'postgres'
        ? `SELECT table_name AS t FROM information_schema.tables
          WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_catalog = '${selectedDatabase}'
          ORDER BY t ASC`
        : `SELECT table_name AS t FROM information_schema.tables
          WHERE table_type = 'BASE TABLE'
          AND table_schema = '${selectedDatabase}'
          ORDER BY t ASC`;

    trpc.sendQuery.query([clientId, tableNamesQuery]).then((rows) => {
      console.log(tableNamesQuery, rows);
      setTables(rows.map(({ t }) => t as string));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatabase, clientId]);

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
