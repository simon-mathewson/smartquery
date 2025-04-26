import { createContext } from 'react';
import type { useCopilot } from './useCopilot';

export const CopilotContext = createContext<ReturnType<typeof useCopilot> | null>(null);
