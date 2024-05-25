import type { PropsWithChildren } from 'react';
import React from 'react';
import { TrpcContext } from './Context';
import { trpcClient } from './client';

export const TrpcProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <TrpcContext.Provider value={trpcClient}>{children}</TrpcContext.Provider>;
};
