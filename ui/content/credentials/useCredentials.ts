import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NativeContext } from '../native/Context';
import { isNative } from '../native/useNative';
import { type Credential, type CredentialType } from '@/utils/credentials';
import type { ModalControl } from '~/shared/components/modal/types';
import type { UserPasswordModalInput } from '../connections/userPasswordModal/types';

export const useCredentials = (props: {
  userPasswordModal: ModalControl<UserPasswordModalInput>;
}) => {
  const { userPasswordModal } = props;

  const native = useDefinedContext(NativeContext);

  const storeCredentialInKeychain = useCallback(
    async (props: { username: string; password: string; type: CredentialType }): Promise<void> => {
      const { username, password, type } = props;

      if (isNative) {
        await native.addToKeychain(username, password, type);
        return;
      }

      if ('credentials' in navigator) {
        await navigator.credentials.store(
          new PasswordCredential({
            id: username,
            password: password,
          }),
        );
      }
    },
    [native],
  );

  const getCredentialFromKeychain = useCallback(
    async (props: { username: string; type: CredentialType }): Promise<string | null> => {
      const { username, type } = props;
      if (isNative) {
        return native.getFromKeychain(username, type);
      }

      return null;
    },
    [native],
  );

  const removeUserCredentialFromKeychain = useCallback(
    async (username: string): Promise<void> => {
      if (isNative) {
        await native.removeFromKeychain(username, 'user');
      }
    },
    [native],
  );

  const getUserCredentialFromKeychain = useCallback(async (): Promise<Credential | null> => {
    if (isNative) {
      return native.getUserCredential();
    }

    return null;
  }, [native]);

  const requestUserPassword = useCallback(
    async (title?: string): Promise<string> => {
      const fromKeychain = await getUserCredentialFromKeychain();
      if (fromKeychain) {
        return fromKeychain.password;
      }

      return new Promise<string>((resolve, reject) =>
        userPasswordModal.open(
          {
            title,
            onSubmit: (password) => {
              resolve(password);
              return Promise.resolve();
            },
          },
          { onClose: reject },
        ),
      );
    },
    [getUserCredentialFromKeychain, userPasswordModal],
  );

  return useMemo(
    () => ({
      getCredentialFromKeychain,
      getUserCredentialFromKeychain,
      storeCredentialInKeychain,
      removeUserCredentialFromKeychain,
      requestUserPassword,
    }),
    [
      getCredentialFromKeychain,
      getUserCredentialFromKeychain,
      storeCredentialInKeychain,
      removeUserCredentialFromKeychain,
      requestUserPassword,
    ],
  );
};
