import React, { createContext } from "react";
import { Connection, DropMarker, Query } from "../types";

export const GlobalContext = createContext<{
  connections: Connection[];
  dropMarkers: DropMarker[];
  isDbReady: boolean;
  queries: Query[][];
  selectedConnectionIndex: number | null;
  selectedDatabase: string | null;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  setDropMarkers: React.Dispatch<React.SetStateAction<DropMarker[]>>;
  setQueries: React.Dispatch<React.SetStateAction<Query[][]>>;
  setSelectedConnectionIndex: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);
