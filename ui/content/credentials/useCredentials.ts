import { useCallback } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { NativeContext } from '../native/Context';
import { isNative } from '../native/useNative';

export const useCredentials = () => {
  const native = useDefinedContext(NativeContext);

  const storeCredential = useCallback(
    async (username: string, password: string, preferWebCredentials?: boolean): Promise<void> => {
      if (isNative) {
        await native.addToKeychain(username, password, preferWebCredentials);
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
    async (username: string): Promise<string | null> => {
      if (isNative) {
        return native.getFromKeychain(username);
      }

      if ('credentials' in navigator) {
        // Should not be used at this time, relying on autofill instead

        try {
          const credential = await navigator.credentials.get({
            password: true,
            mediation: 'optional',
          });

          if (
            credential &&
            'password' in credential &&
            typeof credential.password === 'string' &&
            credential.id === username
          ) {
            return credential.password;
          }
        } catch {
          // User cancelled, no credentials found, or not supported by browser
          return null;
        }
      }

      return null;
    },
    [native],
  );

  return {
    getCredential,
    storeCredential,
  };
};
