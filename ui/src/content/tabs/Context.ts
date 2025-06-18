import { createContext } from 'react';
import type { useTabs } from './useTabs';

export const TabsContext = createContext<ReturnType<typeof useTabs> | null>(null);

TabsContext.displayName = 'TabsContext';
