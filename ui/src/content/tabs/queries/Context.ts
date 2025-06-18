import { createContext } from 'react';
import type { useQueries } from './useQueries';

export const QueriesContext = createContext<ReturnType<typeof useQueries> | null>(null);

QueriesContext.displayName = 'QueriesContext';
