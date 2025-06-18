import { createContext } from 'react';
import type { useSqlite } from './useSqlite';

export type SqliteContextType = ReturnType<typeof useSqlite>;

export const SqliteContext = createContext<SqliteContextType | null>(null);

SqliteContext.displayName = 'SqliteContext';
