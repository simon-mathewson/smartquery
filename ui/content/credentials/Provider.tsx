import type { PropsWithChildren } from 'react';
import { CredentialsContext } from './Context';
import { useCredentials } from './useCredentials';

export const CredentialsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useCredentials();

  return (
    <CredentialsContext.Provider value={context}>
      {children}
    </CredentialsContext.Provider>
  );
};
