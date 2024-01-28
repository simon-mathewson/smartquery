import { createContext } from 'react';
import React, { PropsWithChildren } from 'react';
import { useQueue } from './useQueue';

export const ClickOutsideQueueContext = createContext<ReturnType<typeof useQueue> | null>(null);

export const ClickOutsideQueueProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useQueue();

  return (
    <ClickOutsideQueueContext.Provider value={context}>
      {children}
    </ClickOutsideQueueContext.Provider>
  );
};
