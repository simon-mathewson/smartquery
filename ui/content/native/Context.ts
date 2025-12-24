import { createContext } from 'react';
import type { useNative } from './useNative';

export type NativeContextType = ReturnType<typeof useNative>;

export const NativeContext = createContext<NativeContextType | null>(null);

NativeContext.displayName = 'NativeContext';
