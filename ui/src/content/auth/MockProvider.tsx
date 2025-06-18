import type { PropsWithChildren } from 'react';
import React from 'react';
import { AuthContext } from './Context';

export const AuthMockProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <AuthContext.Provider
      value={{
        isInitializing: false,
        logIn: async () => {},
        logOut: async () => {},
        signUp: async () => {},
        user: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
