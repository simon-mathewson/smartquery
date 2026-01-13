import { useCallback, useMemo } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NativeContext } from '../native/Context';
import { isNative } from '../native/useNative';
import { type Credential, type CredentialType } from '@/utils/credentials';

export const useCredentials = () => {
  const native = useDefinedContext(NativeContext);

  const storeCredential = useCallback(
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

  const getCredential = useCallback(
    async (props: { username: string; type: CredentialType }): Promise<string | null> => {
      const { username, type } = props;
      if (isNative) {
        return native.getFromKeychain(username, type);
      }

      return null;
    },
    [native],
  );

  const removeUserCredential = useCallback(
    async (username: string): Promise<void> => {
      if (isNative) {
        await native.removeFromKeychain(username, 'user');
      }
    },
    [native],
  );

  const getUserCredential = useCallback(async (): Promise<Credential | null> => {
    if (isNative) {
      return native.getUserCredential();
    }

    return null;
  }, [native]);

  return useMemo(
    () => ({
      getCredential,
      getUserCredential,
      storeCredential,
      removeUserCredential,
    }),
    [getCredential, getUserCredential, storeCredential, removeUserCredential],
  );
};
