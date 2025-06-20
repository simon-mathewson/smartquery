import { createContext } from 'react';
import type { useAi } from './useAi';

export type AiContextType = ReturnType<typeof useAi>;

export const AiContext = createContext<AiContextType | null>(null);

AiContext.displayName = 'AiContext';
