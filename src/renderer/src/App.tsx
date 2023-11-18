import React, { useEffect, useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { DropMarker as DropMarkerType, Query as QueryType } from './types';
import { TopBar } from './components/TopBar/TopBar';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';
import { Query } from './components/Query/Query';
import type { Connection, SendQuery } from 'src/preload/index.d';
import { DropMarker } from './components/DropMarker/DropMarker';
import { Sidebar } from './components/Sidebar/Sidebar';

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

  const [queries, setQueries] = useState<QueryType[][]>([]);

  const [dropMarkers, setDropMarkers] = useState<DropMarkerType[]>([]);

  return (
    <GlobalContext.Provider
      value={{
        connections,
        dropMarkers,
        queries,
        selectedConnectionIndex,
        selectedDatabase,
        sendQuery,
        setQueries,
        setConnections,
        setDropMarkers,
        setSelectedConnectionIndex,
        setSelectedDatabase,
      }}
    >
      <Sidebar />
      <TopBar />
      <div className="grid h-full grid-cols-[max-content_1fr] grid-rows-[max-content_1fr] overflow-auto bg-gray-200 pl-[224px] pt-[52px]">
        <div className="relative col-start-2 grid grid-rows-[max-content_1fr]">
          <div className="grid-cols-min grid grid-flow-col justify-start gap-1 p-1">
            <DropMarker column={0} row={0} />
            {queries.map((column, columnIndex) => (
              <React.Fragment key={columnIndex}>
                <div className="grid-rows grid auto-rows-min justify-start gap-1">
                  <DropMarker column={columnIndex} horizontal row={0} />
                  {column.map((query, rowIndex) => (
                    <React.Fragment key={query.id}>
                      <Query query={query} />
                      <DropMarker column={columnIndex} horizontal row={rowIndex + 1} />
                    </React.Fragment>
                  ))}
                </div>
                <DropMarker column={columnIndex + 1} row={0} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </GlobalContext.Provider>
  );
};
