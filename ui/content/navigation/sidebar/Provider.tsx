import { useNavigationSidebar } from './useNavigationSidebar';
import { NavigationSidebarContext } from './Context';
import type { PropsWithChildren } from 'react';

export const NavigationSidebarProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const navigationSidebar = useNavigationSidebar();

  return (
    <NavigationSidebarContext.Provider value={navigationSidebar}>
      {children}
    </NavigationSidebarContext.Provider>
  );
};
