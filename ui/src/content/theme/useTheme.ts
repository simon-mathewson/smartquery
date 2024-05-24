import { useCallback, useEffect, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';
import type { ThemeMode, ThemeModePreference } from './types';

const systemDarkModeQuery = '(prefers-color-scheme: dark)';

export const useTheme = () => {
  const [modePreference, setModePreference] = useStoredState<ThemeModePreference>(
    'modePreference',
    'system',
  );

  const [systemMode, setSystemMode] = useState<ThemeMode>(() =>
    matchMedia(systemDarkModeQuery).matches ? 'dark' : 'light',
  );

  const mode = modePreference === 'system' ? systemMode : modePreference;

  const handleDarkModeChange = useCallback(
    (event: MediaQueryListEvent) => {
      if (modePreference === 'system') {
        setSystemMode(event.matches ? 'dark' : 'light');
      }
    },
    [modePreference, setSystemMode],
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(systemDarkModeQuery);

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

  return { mode, modePreference, setModePreference };
};
