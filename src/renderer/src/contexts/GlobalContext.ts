import React, { createContext } from 'react';
import { Query } from '../types';
import type { Connection, SendQuery } from 'src/preload/index.d';

export const GlobalContext = createContext<{
  connections: Connection[];
  queries: Query[];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  sendQuery: SendQuery | null;
  setQueries: React.Dispatch<React.SetStateAction<Query[]>>;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
} | null>(null);
