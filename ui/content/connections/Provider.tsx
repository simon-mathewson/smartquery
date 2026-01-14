import type { PropsWithChildren } from 'react';
import React from 'react';
import { useModal } from '~/shared/components/modal/useModal';
import { ConnectionsContext } from './Context';
import { SignInModal } from './signInModal/SignInModal';
import type { SignInModalInput } from './signInModal/types';
import { useConnections } from './useConnections';

export const ConnectionsProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const signInModal = useModal<SignInModalInput>();

  const context = useConnections({ signInModal });

  return (
    <>
      <ConnectionsContext.Provider value={context}>
        <SignInModal {...signInModal} />
        {children}
      </ConnectionsContext.Provider>
    </>
  );
};
