import { createContext } from 'react';
import type { useConnections } from './useConnections';

export const ConnectionsContext = createContext<ReturnType<typeof useConnections> | null>(null);
