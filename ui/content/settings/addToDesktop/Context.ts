import { createContext } from 'react';
import type { useAddToDesktop } from './useAddToDesktop';

export type AddToDesktopContextType = ReturnType<typeof useAddToDesktop>;

export const AddToDesktopContext = createContext<AddToDesktopContextType | null>(null);

AddToDesktopContext.displayName = 'AddToDesktopContext';
