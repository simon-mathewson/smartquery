import { createContext } from 'react';
import type { QueryContextValue } from './Provider';
import type { QueryResult } from '~/shared/types';

export const QueryContext = createContext<QueryContextValue | null>(null);

export const ResultContext = createContext<QueryResult | null>(null);
