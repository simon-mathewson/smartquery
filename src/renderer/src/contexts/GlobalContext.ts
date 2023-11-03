import { createContext } from 'react';
import { Connection } from '../types';

export const GlobalContext = createContext<{
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  selectedTable: string | null;
  setSelectedTable: React.Dispatch<React.SetStateAction<string | null>>;
  tables: string[];
} | null>(null);
