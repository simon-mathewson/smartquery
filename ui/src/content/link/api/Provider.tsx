import type { PropsWithChildren } from 'react';
import React from 'react';
import { LinkApiContext } from './Context';
import { linkApiClient } from './client';

export const LinkApiProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <LinkApiContext.Provider value={linkApiClient}>{children}</LinkApiContext.Provider>;
};
