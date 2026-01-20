import { createContext } from 'react';
import type { useMobileNavigation } from './useMobileNavigation';

export type MobileNavigationContextType = ReturnType<typeof useMobileNavigation>;

export const MobileNavigationContext = createContext<MobileNavigationContextType | null>(null);
