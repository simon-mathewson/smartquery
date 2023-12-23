import React, { createContext } from 'react';
import { Connection, DropMarker, Query } from '../types';

export const GlobalContext = createContext<{
  clientId: string | null;
  connections: Connection[];
  dropMarkers: DropMarker[];
  overlayCardRefs: Array<React.MutableRefObject<HTMLElement | null>>;
  queries: Query[][];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setDropMarkers: React.Dispatch<React.SetStateAction<DropMarker[]>>;
  setOverlayCardRefs: React.Dispatch<
    React.SetStateAction<Array<React.MutableRefObject<HTMLElement | null>>>
  >;
  setQueries: React.Dispatch<React.SetStateAction<Query[][]>>;
  setSelectedConnectionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);
