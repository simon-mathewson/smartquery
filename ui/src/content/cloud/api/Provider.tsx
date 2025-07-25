import type { PropsWithChildren } from 'react';
import React from 'react';
import { cloudApi } from './client';
import { CloudApiContext } from './Context';

export const CloudApiProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <CloudApiContext.Provider value={cloudApi}>{children}</CloudApiContext.Provider>;
};
