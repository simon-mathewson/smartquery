import type { PropsWithChildren } from 'react';
import React from 'react';
import { ApiContext } from './Context';
import { apiClient } from './client';

export const ApiProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
};
