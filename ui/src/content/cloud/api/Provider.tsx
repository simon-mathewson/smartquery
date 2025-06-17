import type { PropsWithChildren } from 'react';
import React from 'react';
import { cloudApiClient } from './client';
import { CloudApiContext } from './Context';

export const CloudApiProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <CloudApiContext.Provider value={cloudApiClient}>{children}</CloudApiContext.Provider>;
};
