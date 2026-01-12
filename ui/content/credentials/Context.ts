import { createContext } from 'react';
import type { useCredentials } from './useCredentials';

export type CredentialsContextType = ReturnType<typeof useCredentials>;

export const CredentialsContext = createContext<CredentialsContextType | null>(null);

CredentialsContext.displayName = 'CredentialsContext';
