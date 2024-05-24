import { createContext } from 'react';
import type { useTheme } from './useTheme';

export const ThemeContext = createContext<ReturnType<typeof useTheme> | null>(null);
