import { createContext } from 'react';
import type { useAuth } from './useAuth';

export const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

AuthContext.displayName = 'AuthContext';
