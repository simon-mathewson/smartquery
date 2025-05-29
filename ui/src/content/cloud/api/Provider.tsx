import type { PropsWithChildren } from 'react';
import React from 'react';
import { CloudApiContext } from './Context';
import { cloudApiClient } from './client';

export const CloudApiProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <CloudApiContext.Provider value={cloudApiClient}>{children}</CloudApiContext.Provider>;
};
