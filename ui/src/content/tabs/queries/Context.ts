import { createContext } from 'react';
import type { useQueries } from './useQueries';

export type QueriesContextType = ReturnType<typeof useQueries>;

export const QueriesContext = createContext<QueriesContextType | null>(null);

QueriesContext.displayName = 'QueriesContext';
