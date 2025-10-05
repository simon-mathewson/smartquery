import { createContext } from 'react';
import type { useTheme } from './useTheme';

export type ThemeContextType = ReturnType<typeof useTheme>;

export const ThemeContext = createContext<ThemeContextType | null>(null);

ThemeContext.displayName = 'ThemeContext';
