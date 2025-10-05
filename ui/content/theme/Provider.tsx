import type { PropsWithChildren } from 'react';
import { ThemeContext } from './Context';
import { useTheme } from './useTheme';
import { createTheme } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useTheme();

  const muiTheme = createTheme({ palette: { mode: context.mode } });

  return (
    <ThemeContext.Provider value={context}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
