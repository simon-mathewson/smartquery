import { GlobalContext } from "~/contexts/GlobalContext";
import { useDefinedContext } from "~/hooks/useDefinedContext";
import React, { useEffect, useState } from "react";
import { Item } from "./Item/Item";
import { trpc } from "~/main";

export const TableList: React.FC = () => {
  const { isDbReady, selectedDatabase } = useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDatabase || !isDbReady) return;

    trpc.sendQuery
      .query(
        `SELECT * FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_catalog = '${selectedDatabase}'
        ORDER BY table_name ASC`
      )
      .then((data) => {
        setTables(data.rows.map(({ table_name }) => table_name));
      });
  }, [selectedDatabase, isDbReady]);

  return (
    <div className="overflow-auto py-2">
      {tables.length > 0 ? (
        tables.map((tableName) => (
          <Item key={tableName} tableName={tableName} />
        ))
      ) : (
        <div className="py-1 text-center text-xs text-gray-500">
          This database is empty.
        </div>
      )}
    </div>
  );
};
