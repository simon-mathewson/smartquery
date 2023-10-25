import { useEffect } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Connection } from './types';
import { AddConnection } from './components/AddConnection/AddConnection';
import { TopBar } from './components/TopBar/TopBar';
import { GlobalContext } from './contexts/GlobalContext';
import './index.css';

function App(): JSX.Element {
  const [connections, setConnections] = useLocalStorageState<Connection[]>('connections', []);

  useEffect(() => {
    // eslint-disable-next-line prettier/prettier
    window.query('SELECT datname FROM pg_database ORDER BY datname ASC').then((data) => {
      console.log(data.rows);
    });
  }, []);

  return (
    <GlobalContext.Provider value={{ connections, setConnections }}>
      <div className="grid h-full grid-rows-[max-content_1fr]">
        <TopBar />
        <div>
          <AddConnection />
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
