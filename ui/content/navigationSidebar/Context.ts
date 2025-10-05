import { createContext } from 'react';
import type { useNavigationSidebar } from './useNavigationSidebar';

export type NavigationSidebarContextType = ReturnType<typeof useNavigationSidebar>;

export const NavigationSidebarContext = createContext<NavigationSidebarContextType | null>(null);
