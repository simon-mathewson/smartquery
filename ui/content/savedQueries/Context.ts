import { createContext } from 'react';
import type { useSavedQueries } from './useSavedQueries';

export type SavedQueriesContextType = ReturnType<typeof useSavedQueries>;

export const SavedQueriesContext = createContext<SavedQueriesContextType | null>(null);

SavedQueriesContext.displayName = 'SavedQueriesContext';
