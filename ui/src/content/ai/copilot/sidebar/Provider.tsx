import type { PropsWithChildren } from 'react';
import { useCopilotSidebar } from './useCopilotSidebar';
import { CopilotSidebarContext } from './Context';

export const CopilotSidebarProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const copilotSidebar = useCopilotSidebar();

  return (
    <CopilotSidebarContext.Provider value={copilotSidebar}>
      {children}
    </CopilotSidebarContext.Provider>
  );
};
