import React, { createContext } from 'react';
import { Connection, Query } from '../types';

export const GlobalContext = createContext<{
  connections: Connection[];
  isConnected: boolean;
  queries: Query[];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
} | null>(null);
