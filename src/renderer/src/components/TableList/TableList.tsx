import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Select } from '../shared/Select/Select';
import { ListItem } from '../shared/ListItem/ListItem';

export const TableList: React.FC = () => {
  const { isConnected, selectedDatabase, setSelectedDatabase, setQueries } =
    useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDatabase || !isConnected) return;

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
          .query(`SELECT datname FROM pg_database WHERE datistemplate = FALSE ORDER BY datname ASC`)
          .then((data) => {
            setDatabases(data.rows.map(({ datname }) => datname));
          });
      });
  }, [selectedDatabase, isConnected]);

  const selectTable = (tableName: string) => {
    setQueries([
      {
        label: tableName,
        sql: `SELECT * FROM "${tableName}" LIMIT 50`,
      },
    ]);
  };

  return (
    <div className="sticky left-0 top-0 z-10 grid h-max max-h-full w-56 flex-shrink-0 grid-rows-[max-content_1fr] rounded-xl bg-gray-100 shadow-lg">
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
        {tables.length > 0 ? (
          tables.map((tableName) => (
            <ListItem
              key={tableName}
              label={tableName}
              onClick={() => selectTable(tableName)}
              selectedVariant="primary"
            />
          ))
        ) : (
          <div className="py-2 text-center text-xs text-gray-500">This database is empty.</div>
        )}
      </div>
    </div>
  );
};
