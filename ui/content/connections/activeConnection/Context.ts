import { createContext } from 'react';
import type { useActiveConnection } from './useActiveConnection';

export type ActiveConnectionContextType = ReturnType<typeof useActiveConnection>;

export const ActiveConnectionContext = createContext<ActiveConnectionContextType | null>(null);

ActiveConnectionContext.displayName = 'ActiveConnectionContext';
