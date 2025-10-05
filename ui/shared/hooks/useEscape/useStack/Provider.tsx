import type { PropsWithChildren } from 'react';
import React from 'react';
import { useEscapeStack } from './useStack';
import { EscapeStackContext } from './Context';

export const EscapeStackProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useEscapeStack();

  return <EscapeStackContext.Provider value={context}>{children}</EscapeStackContext.Provider>;
};
