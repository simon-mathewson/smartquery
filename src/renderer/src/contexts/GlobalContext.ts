import { createContext } from 'react';
import { Connection } from '../types';

export const GlobalContext = createContext<{
  connections: Connection[];
  isConnected: boolean;
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  selectedTable: string | null;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedTable: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);
