import { useCallback, useEffect, useState } from 'react';
import { useLocalStorageState } from '~/shared/hooks/useLocalStorageState';
import type { ThemeMode } from './types';

const darkModeQuery = '(prefers-color-scheme: dark)';

export const useTheme = () => {
  const [modePreference] = useLocalStorageState<ThemeMode | 'system'>('modePreference', 'system');

  const [mode, setMode] = useState<ThemeMode>(() =>
    matchMedia(darkModeQuery).matches ? 'dark' : 'light',
  );

  const handleDarkModeChange = useCallback(
    (event: MediaQueryListEvent) => {
      if (modePreference === 'system') {
        setMode(event.matches ? 'dark' : 'light');
      }
    },
    [modePreference, setMode],
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(darkModeQuery);

    mediaQueryList.addEventListener('change', handleDarkModeChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleDarkModeChange);
    };
  }, [handleDarkModeChange]);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [mode]);

  return { mode };
};
