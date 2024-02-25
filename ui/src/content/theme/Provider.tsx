import type { PropsWithChildren } from 'react';
import { ThemeContext } from './Context';
import { useTheme } from './useTheme';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useTheme();

  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
};
