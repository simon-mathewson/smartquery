import React, { createContext } from 'react';
import { DropMarker, Query } from '../types';
import type { Connection, SendQuery } from 'src/preload/index.d';

export const GlobalContext = createContext<{
  connections: Connection[];
  dropMarkers: DropMarker[];
  queryGroups: Query[][][];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  sendQuery: SendQuery | null;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setDropMarkers: React.Dispatch<React.SetStateAction<DropMarker[]>>;
  setQueryGroups: React.Dispatch<React.SetStateAction<Query[][][]>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);
