import type { PropsWithChildren } from 'react';
import React from 'react';
import { AuthContext } from './Context';
import { useAuth } from './useAuth';

export const AuthProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
