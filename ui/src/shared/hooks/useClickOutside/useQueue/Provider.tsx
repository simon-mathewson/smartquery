import type { PropsWithChildren } from 'react';
import React from 'react';
import { useQueue } from './useQueue';
import { ClickOutsideQueueContext } from './Context';

export const ClickOutsideQueueProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useQueue();

  return (
    <ClickOutsideQueueContext.Provider value={context}>
      {children}
    </ClickOutsideQueueContext.Provider>
  );
};
