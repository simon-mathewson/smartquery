import { useEffect, useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Connection } from './types';
import { TopBar } from './components/TopBar/TopBar';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';
import { TableList } from './components/TableList/TableList';

function App(): JSX.Element {
  const [connections, setConnections] = useLocalStorageState<Connection[]>('connections', [
    {
      database: 'mathewson_metals_dev',
      host: 'localhost',
      name: 'Mathewson Metals',
      port: 5432,
    },
  ]);

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

  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <GlobalContext.Provider
      value={{ connections, setConnections, selectedTable, setSelectedTable, tables }}
    >
      <div className="grid h-full grid-rows-[max-content_1fr]">
        <TopBar />
        <div className="flex overflow-hidden">
          <TableList />
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
