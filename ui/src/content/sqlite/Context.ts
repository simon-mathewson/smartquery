import { createContext } from 'react';
import type { useSqlite } from './useSqlite';

export const SqliteContext = createContext<ReturnType<typeof useSqlite> | null>(null);

SqliteContext.displayName = 'SqliteContext';
