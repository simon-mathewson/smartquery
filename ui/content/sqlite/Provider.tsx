import type { PropsWithChildren } from 'react';
import { SqliteContext } from './Context';
import { useSqlite } from './useSqlite';

export const SqliteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useSqlite();

  return <SqliteContext.Provider value={context}>{children}</SqliteContext.Provider>;
};
