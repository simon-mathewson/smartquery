import React, { createContext } from 'react';
import { DropMarker, Query } from '../types';

declare global {
  interface Window {
    api: Api;
  }
}

export type Api = {
  connectDb: (connection: Connection) => Promise<{ sendQuery: SendQuery }>;
};

export type Connection = {
  database: string;
  host: string;
  name: string;
  password: string;
  port: number;
  user: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SendQuery = (sql: string) => Promise<any>;


export const GlobalContext = createContext<{
  connections: Connection[];
  dropMarkers: DropMarker[];
  queries: Query[][];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  sendQuery: SendQuery | null;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setDropMarkers: React.Dispatch<React.SetStateAction<DropMarker[]>>;
  setQueries: React.Dispatch<React.SetStateAction<Query[][]>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);
