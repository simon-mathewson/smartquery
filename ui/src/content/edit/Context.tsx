import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useEdit } from './useEdit';

export const EditContext = createContext<ReturnType<typeof useEdit> | null>(null);

export const EditProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useEdit();

  return <EditContext.Provider value={context}>{children}</EditContext.Provider>;
};
