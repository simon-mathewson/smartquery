import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useConnections } from './useConnections';

export const ConnectionsContext = createContext<ReturnType<typeof useConnections> | null>(null);

export const ConnectionsProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useConnections();

  return <ConnectionsContext.Provider value={context}>{children}</ConnectionsContext.Provider>;
};
