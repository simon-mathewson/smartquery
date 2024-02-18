import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Item } from './Item/Item';
import { trpc } from '~/trpc';
import { ConnectionsContext } from '../connections/Context';

export const TableList: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { clientId, database, engine } = activeConnection;

    const tableNamesQuery = {
      mysql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema = '${database}'
        ORDER BY t ASC`,
      postgresql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${database}'
        ORDER BY t ASC`,
      sqlserver: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_catalog = '${database}'
        ORDER BY t ASC`,
    }[engine];

    trpc.sendQuery.query([clientId, tableNamesQuery]).then(([{ rows }]) => {
      setTables(rows.map(({ t }) => t as string));
    });
  }, [activeConnection]);

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
