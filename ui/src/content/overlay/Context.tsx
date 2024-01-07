import { createContext } from 'react';
import React, { PropsWithChildren } from 'react';
import { useOverlay } from './useOverlay';

export const OverlayContext = createContext<ReturnType<typeof useOverlay> | null>(null);

export const OverlayProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useOverlay();

  return <OverlayContext.Provider value={context}>{children}</OverlayContext.Provider>;
};
