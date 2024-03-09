import { createContext } from 'react';
import type { useSearch } from './useSearch';

export const SearchContext = createContext<ReturnType<typeof useSearch> | null>(null);
