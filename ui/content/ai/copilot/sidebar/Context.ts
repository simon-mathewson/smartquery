import { createContext } from 'react';
import type { useCopilotSidebar } from './useCopilotSidebar';

export type CopilotSidebarContextType = ReturnType<typeof useCopilotSidebar>;

export const CopilotSidebarContext = createContext<CopilotSidebarContextType | null>(null);
