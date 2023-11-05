import { useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Connection } from './types';
import { TopBar } from './components/TopBar/TopBar';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';
import { TableList } from './components/TableList/TableList';
import { Table } from './components/Table/Table';

function App(): JSX.Element {
  const [connections, setConnections] = useLocalStorageState<Connection[]>('connections', [
    {
      database: 'mathewson_metals_development',
      host: 'localhost',
      name: 'Mathewson Metals',
      port: 5432,
    },
  ]);

  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <GlobalContext.Provider
      value={{ connections, setConnections, selectedTable, setSelectedTable }}
    >
      <div className="grid h-full grid-rows-[max-content_1fr]">
        <TopBar />
        <div className="flex overflow-hidden h-full">
          <TableList />
          <div className="p-8">
            <Table />
          </div>
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
