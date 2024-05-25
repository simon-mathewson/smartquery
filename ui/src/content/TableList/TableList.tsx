import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Item } from './Item/Item';
import { ConnectionsContext } from '../connections/Context';
import { TrpcContext } from '../trpc/Context';

export const TableList: React.FC = () => {
  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { clientId, database, engine } = activeConnection;

    const tableNamesStatement = {
      mysql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema = '${database}'
        ORDER BY t ASC`,
      postgresql: `SELECT table_name AS t FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${database}'
        ORDER BY t ASC`,
    }[engine];

    trpc.sendQuery.mutate({ clientId, statements: [tableNamesStatement] }).then(([rows]) => {
      setTables(rows.map(({ t }) => String(t)));
    });
  }, [activeConnection, trpc.sendQuery]);

  return (
    <div className="flex flex-col gap-1 overflow-auto py-2">
      {tables.length > 0 ? (
        tables.map((tableName) => <Item key={tableName} tableName={tableName} />)
      ) : (
        <div className="py-1 text-center text-xs">This database is empty.</div>
      )}
    </div>
  );
};
