import { createContext } from 'react';
import type { useTabs } from './useTabs';

export type TabsContextType = ReturnType<typeof useTabs>;

export const TabsContext = createContext<TabsContextType | null>(null);

TabsContext.displayName = 'TabsContext';
