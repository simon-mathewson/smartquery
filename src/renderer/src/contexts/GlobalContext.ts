import { createContext } from 'react';
import { Connection } from '../types';

export const GlobalContext = createContext<{
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
} | null>(null);
