import React, { useEffect, useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Connection, DropMarker as DropMarkerType } from './types';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';
import { Query as QueryType } from './types';
import { DropMarker } from './components/DropMarker/DropMarker';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Query } from './components/Query/Query';
import { trpc } from './main';

export const App: React.FC = () => {
  const [connections, setConnections] = useLocalStorageState<Connection[]>('connections', [
    {
      database: 'mathewson_metals_development',
      engine: 'postgres',
      host: 'localhost',
      name: 'Mathewson Metals',
      password: 'password',
      port: 5432,
      user: 'postgres',
    },
    {
      database: 'dabase_test_1',
      engine: 'postgres',
      host: 'localhost',
      name: 'Dabase Test 1',
      password: 'password',
      port: 5433,
      user: 'postgres',
    },
    {
      database: 'dabase_test_2',
      engine: 'postgres',
      host: 'localhost',
      name: 'Dabase Test 2',
      password: 'password',
      port: 5434,
      user: 'postgres',
    },
    {
      database: 'dabase_test_3',
      engine: 'postgres',
      host: 'localhost',
      name: 'Dabase Test 3',
      password: 'password',
      port: 5435,
      user: 'postgres',
    },
  ]);

  const [selectedConnectionIndex, setSelectedConnectionIndex] = useState<number | null>(0);

  const [clientId, setClientId] = useState<string | null>(null);

  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  const connect = async (connection: Connection) => {
    if (clientId) {
      await trpc.disconnectDb.mutate(clientId);
    }

    setClientId(null);
    setQueries([]);

    try {
      const newClientId = await trpc.connectDb.mutate(connection);
      setClientId(newClientId);
    } catch {
      setClientId(null);
    }
  };

  useEffect(() => {
    if (selectedConnectionIndex === null) return;

    const selectedConnection = connections[selectedConnectionIndex];

    setSelectedDatabase(selectedConnection.database);
  }, [connections, selectedConnectionIndex]);

  useEffect(() => {
    if (selectedConnectionIndex === null || !selectedDatabase) return;

    const selectedConnection = connections[selectedConnectionIndex];

    connect({ ...selectedConnection, database: selectedDatabase });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, selectedDatabase]);

  const [queries, setQueries] = useState<QueryType[][]>([]);

  const [dropMarkers, setDropMarkers] = useState<DropMarkerType[]>([]);

  const [overlayCardRefs, setOverlayCardRefs] = useState<
    Array<React.MutableRefObject<HTMLElement | null>>
  >([]);

  return (
    <GlobalContext.Provider
      value={{
        clientId,
        connections,
        dropMarkers,
        overlayCardRefs,
        queries,
        selectedConnectionIndex,
        selectedDatabase,
        setConnections,
        setDropMarkers,
        setOverlayCardRefs,
        setQueries,
        setSelectedConnectionIndex,
        setSelectedDatabase,
      }}
    >
      <Sidebar />
      <div className="h-full overflow-hidden bg-white pl-[224px]">
        <div className="flex h-full justify-start overflow-hidden">
          <DropMarker column={0} row={0} />
          {queries.map((column, columnIndex) => (
            <React.Fragment key={columnIndex}>
              <div className="flex w-full flex-col justify-start overflow-hidden">
                <DropMarker column={columnIndex} horizontal row={0} />
                {column.map((query, rowIndex) => (
                  <React.Fragment key={query.id}>
                    <Query columnIndex={columnIndex} query={query} rowIndex={rowIndex} />
                    <DropMarker column={columnIndex} horizontal row={rowIndex + 1} />
                  </React.Fragment>
                ))}
              </div>
              <DropMarker column={columnIndex + 1} row={0} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </GlobalContext.Provider>
  );
};
