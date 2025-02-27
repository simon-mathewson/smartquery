import { createContext } from 'react';
import type { useAi } from './useAi';

export const AiContext = createContext<ReturnType<typeof useAi> | null>(null);
