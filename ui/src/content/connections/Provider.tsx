import type { PropsWithChildren } from 'react';
import React from 'react';
import { useConnections } from './useConnections';
import { ConnectionsContext } from './Context';
import { SignInModal } from './signInModal/SignInModal';
import { useModal } from '~/shared/components/modal/useModal';
import type { SignInModalInput } from './signInModal/types';

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
