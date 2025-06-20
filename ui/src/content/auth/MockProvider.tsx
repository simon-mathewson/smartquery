import React from 'react';
import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { AuthContextType } from './Context';
import { AuthContext } from './Context';

export const AuthMockProvider: React.FC<MockProviderProps<AuthContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <AuthContext.Provider
      value={Object.assign(
        {
          isInitializing: false,
          logIn: async () => {},
          logOut: async () => {},
          signUp: async () => {},
          user: null,
        },
        overrides,
      )}
    >
      {children}
    </AuthContext.Provider>
  );
};
