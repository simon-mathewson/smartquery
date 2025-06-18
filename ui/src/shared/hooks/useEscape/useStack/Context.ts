import { createContext } from 'react';
import type { useEscapeStack } from './useStack';

export type EscapeStackContextType = ReturnType<typeof useEscapeStack>;

export const EscapeStackContext = createContext<EscapeStackContextType | null>(null);

EscapeStackContext.displayName = 'EscapeStackContext';
