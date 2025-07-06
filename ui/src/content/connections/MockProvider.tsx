import type { MockProviderProps } from '~/providers/MockProviderProps';
import { useModal } from '~/shared/components/modal/useModal';
import type { ConnectionsContextType } from './Context';
import { ConnectionsContext } from './Context';
import { getContextMock } from './mocks';
import { SignInModal } from './signInModal/SignInModal';
import type { SignInModalInput } from './signInModal/types';
import type { UserPasswordModalInput } from './userPasswordModal/types';
import { UserPasswordModal } from './userPasswordModal/UserPasswordModal';

export const ConnectionsMockProvider: React.FC<MockProviderProps<ConnectionsContextType>> = (
  props,
) => {
  const { children, overrides } = props;

  const signInModal = useModal<SignInModalInput>();
  const userPasswordModal = useModal<UserPasswordModalInput>();

  return (
    <>
      <ConnectionsContext.Provider value={Object.assign(getContextMock(), overrides)}>
        <SignInModal {...signInModal} />
        <UserPasswordModal {...userPasswordModal} />
        {children}
      </ConnectionsContext.Provider>
    </>
  );
};
