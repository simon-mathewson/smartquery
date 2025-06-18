import { createContext } from 'react';
import type { Connections } from './useConnections';

export type ConnectionsContextType = Connections;

export const ConnectionsContext = createContext<ConnectionsContextType | null>(null);

ConnectionsContext.displayName = 'ConnectionsContext';
