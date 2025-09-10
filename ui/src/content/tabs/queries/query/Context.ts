import { createContext } from 'react';
import type { QueryContextValue } from './Provider';
import type { QueryResult } from '~/shared/types';
import type { SavedQuery } from '@/savedQueries/types';

export const QueryContext = createContext<QueryContextValue | null>(null);
QueryContext.displayName = 'QueryContext';

export const ResultContext = createContext<QueryResult | null>(null);
ResultContext.displayName = 'ResultContext';

export const SavedQueryContext = createContext<SavedQuery | null>(null);
SavedQueryContext.displayName = 'SavedQueryContext';
