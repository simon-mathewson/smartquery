import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NativeContext } from '../native/Context';
import { isNative } from '../native/useNative';
import { type Credential, type CredentialType } from '@/utils/credentials';

export const useCredentials = () => {
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

  const getUserCredentialFromKeychain = useCallback(
    async (username?: string): Promise<Credential | null> => {
      if (isNative) {
        return native.getUserCredential(username);
      }

      return null;
    },
    [native],
  );

  return useMemo(
    () => ({
      getCredentialFromKeychain,
      getUserCredentialFromKeychain,
      storeCredentialInKeychain,
      removeUserCredentialFromKeychain,
    }),
    [
      getCredentialFromKeychain,
      getUserCredentialFromKeychain,
      storeCredentialInKeychain,
      removeUserCredentialFromKeychain,
    ],
  );
};
