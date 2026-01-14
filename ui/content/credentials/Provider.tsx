import type { PropsWithChildren } from 'react';
import { CredentialsContext } from './Context';
import { useCredentials } from './useCredentials';
import type { UserPasswordModalInput } from '../connections/userPasswordModal/types';
import { UserPasswordModal } from '../connections/userPasswordModal/UserPasswordModal';
import { useModal } from '~/shared/components/modal/useModal';

export const CredentialsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const userPasswordModal = useModal<UserPasswordModalInput>();

  const context = useCredentials({ userPasswordModal });

  return (
    <CredentialsContext.Provider value={context}>
      <UserPasswordModal {...userPasswordModal} />
      {children}
    </CredentialsContext.Provider>
  );
};
