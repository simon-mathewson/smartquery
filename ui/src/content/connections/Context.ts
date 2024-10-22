import { createContext } from 'react';
import type { Connections } from './useConnections';

export const ConnectionsContext = createContext<Connections | null>(null);
