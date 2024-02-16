import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useQueries } from './useQueries';

export const QueriesContext = createContext<ReturnType<typeof useQueries> | null>(null);

export const QueriesProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useQueries();

  return <QueriesContext.Provider value={context}>{children}</QueriesContext.Provider>;
};
