import { createContext } from 'react';
import type { useAuth } from './useAuth';

export type AuthContextType = ReturnType<typeof useAuth>;

export const AuthContext = createContext<AuthContextType | null>(null);

AuthContext.displayName = 'AuthContext';
