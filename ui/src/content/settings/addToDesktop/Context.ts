import { createContext } from 'react';
import type { useAddToDesktop } from './useAddToDesktop';

export const AddToDesktopContext = createContext<ReturnType<typeof useAddToDesktop> | null>(null);

AddToDesktopContext.displayName = 'AddToDesktopContext';
