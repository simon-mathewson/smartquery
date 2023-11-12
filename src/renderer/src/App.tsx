import { useEffect, useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Query as QueryType } from './types';
import { TopBar } from './components/TopBar/TopBar';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';
import { TableList } from './components/TableList/TableList';
import { Button } from './components/shared/Button/Button';
import { Add } from '@mui/icons-material';
import { Query } from './components/Query/Query';
import { uniqueId } from 'lodash';
import type { Connection, SendQuery } from 'src/preload/index.d';

export const App: React.FC = () => {
  const [connections, setConnections] = useLocalStorageState<Connection[]>('connections', [
    {
      database: 'mathewson_metals_development',
      host: 'localhost',
      name: 'Mathewson Metals',
      password: 'password',
      port: 5432,
      user: 'postgres',
    },
    {
      database: 'dabase_test_1',
      host: 'localhost',
      name: 'Dabase Test 1',
      password: 'password',
      port: 5433,
      user: 'postgres',
    },
    {
      database: 'dabase_test_2',
      host: 'localhost',
      name: 'Dabase Test 2',
      password: 'password',
      port: 5434,
      user: 'postgres',
    },
    {
      database: 'dabase_test_3',
      host: 'localhost',
      name: 'Dabase Test 3',
      password: 'password',
      port: 5435,
      user: 'postgres',
    },
  ]);

  const [selectedConnectionIndex, setSelectedConnectionIndex] = useState<number | null>(0);

  const [sendQuery, setSendQuery] = useState<SendQuery | null>(null);

  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  const connect = (connection: Connection) => {
    setSendQuery(null);
    setQueries([]);

    window.api
      .connectDb(connection)
      .then(({ sendQuery }) => {
        setSendQuery(() => sendQuery);
      })
      .catch(() => {
        setSendQuery(null);
      });
  };

  useEffect(() => {
    if (selectedConnectionIndex === null) return;

    const selectedConnection = connections[selectedConnectionIndex];

    setSelectedDatabase(selectedConnection.database);
  }, [selectedConnectionIndex]);

  useEffect(() => {
    if (selectedConnectionIndex === null || !selectedDatabase) return;

    const selectedConnection = connections[selectedConnectionIndex];

    connect({ ...selectedConnection, database: selectedDatabase });
  }, [selectedDatabase]);

  const [queries, setQueries] = useState<QueryType[]>([]);

  return (
    <GlobalContext.Provider
      value={{
        connections,
        queries,
        selectedConnectionIndex,
        selectedDatabase,
        sendQuery,
        setQueries,
        setConnections,
        setSelectedConnectionIndex,
        setSelectedDatabase,
      }}
    >
      <div className="grid h-full grid-rows-[max-content_1fr] bg-gray-200">
        <TopBar />
        <div className="flex h-full gap-6 overflow-hidden px-4 pb-4">
          <div className="grid h-full grid-rows-[max-content_minmax(auto,max-content)] gap-4">
            <Button
              align="left"
              icon={<Add />}
              label="Query"
              onClick={() => setQueries([{ id: uniqueId(), showEditor: true }])}
              variant="primary"
            />
            <TableList />
          </div>
          {queries.map((query) => (
            <Query key={query.id} query={query} />
          ))}
        </div>
      </div>
    </GlobalContext.Provider>
  );
};
