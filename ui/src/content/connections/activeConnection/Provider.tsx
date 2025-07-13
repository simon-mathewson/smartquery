import type { PropsWithChildren } from 'react';
import React from 'react';
import { ActiveConnectionContext } from './Context';
import { useActiveConnection } from './useActiveConnection';

export const ActiveConnectionProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useActiveConnection();

  return (
    <>
      <ActiveConnectionContext.Provider value={context}>
        {children}
      </ActiveConnectionContext.Provider>
    </>
  );
};
