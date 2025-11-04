import { createContext } from 'react';
import type { useCopilot } from './useCopilot';

export type CopilotContextType = ReturnType<typeof useCopilot>;

export const CopilotContext = createContext<CopilotContextType | null>(null);

CopilotContext.displayName = 'CopilotContext';
