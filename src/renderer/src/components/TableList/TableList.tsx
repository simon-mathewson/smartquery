import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { Select } from '../shared/Select/Select';
import { ListItem } from '../shared/ListItem/ListItem';
import { uniqueId } from 'lodash';

export const TableList: React.FC = () => {
  const { selectedDatabase, sendQuery, setSelectedDatabase, setQueries } =
    useDefinedContext(GlobalContext);

  const [tables, setTables] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);

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

      sendQuery(
        `SELECT datname FROM pg_database WHERE datistemplate = FALSE ORDER BY datname ASC`,
      ).then((data) => {
        setDatabases(data.rows.map(({ datname }) => datname));
      });
    });
  }, [selectedDatabase, sendQuery]);

  const selectTable = (tableName: string) => {
    setQueries([
      {
        id: uniqueId(),
        label: tableName,
        sql: `SELECT * FROM "${tableName}" LIMIT 50`,
      },
    ]);
  };

  return (
    <div className="flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl bg-gray-100 shadow-lg">
      <div className="border-b-[1px] border-b-gray-200 p-2">
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
