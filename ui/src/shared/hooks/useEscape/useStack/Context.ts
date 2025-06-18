import { createContext } from 'react';
import type { useEscapeStack } from './useStack';

export const EscapeStackContext = createContext<ReturnType<typeof useEscapeStack> | null>(null);

EscapeStackContext.displayName = 'EscapeStackContext';
