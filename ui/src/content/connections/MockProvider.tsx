import type { MockProviderProps } from '~/providers/MockProviderProps';
import { useModal } from '~/shared/components/modal/useModal';
import { ConnectionsContext } from './Context';
import { SignInModal } from './signInModal/SignInModal';
import type { SignInModalInput } from './signInModal/types';
import type { useConnections } from './useConnections';
import type { UserPasswordModalInput } from './UserPasswordModal/types';
import { UserPasswordModal } from './UserPasswordModal/UserPasswordModal';
import { getConnectionsContextMock } from './mocks';

export const ConnectionsMockProvider: React.FC<
  MockProviderProps<ReturnType<typeof useConnections>>
> = (props) => {
  const { children, overrides } = props;

  const signInModal = useModal<SignInModalInput>();
  const userPasswordModal = useModal<UserPasswordModalInput>();

  return (
    <>
      <ConnectionsContext.Provider
        value={{
          ...getConnectionsContextMock(),
          ...overrides,
        }}
      >
        <SignInModal {...signInModal} />
        <UserPasswordModal {...userPasswordModal} />
        {children}
      </ConnectionsContext.Provider>
    </>
  );
};
