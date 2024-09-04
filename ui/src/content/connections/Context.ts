import { createContext } from 'react';
import type { UseConnections } from './useConnections';

export const ConnectionsContext = createContext<UseConnections | null>(null);
