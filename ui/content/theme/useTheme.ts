import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import type { ThemeMode, ThemeModePreference } from './types';
import type colors from 'tailwindcss/colors';

const systemDarkModeQuery = '(prefers-color-scheme: dark)';

export const useTheme = () => {
  const [modePreference, setModePreference] = useStoredState<ThemeModePreference>(
    'modePreference',
    'system',
  );

  const [systemMode, setSystemMode] = useState<ThemeMode>(() => {
    if (typeof matchMedia === 'undefined') return 'light';

    return matchMedia(systemDarkModeQuery).matches ? 'dark' : 'light';
  });

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
    if (typeof matchMedia === 'undefined') return;

    const mediaQueryList = window.matchMedia(systemDarkModeQuery);

    mediaQueryList.addEventListener('change', handleDarkModeChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleDarkModeChange);
    };
  }, [handleDarkModeChange]);

  const [primaryColor, setPrimaryColor] = useStoredState<keyof typeof colors>(
    'useTheme.primaryColor',
    'blue',
  );

  const currentClassNames = useRef<string[]>([]);

  useEffect(() => {
    if (currentClassNames.current.length) {
      document.documentElement.classList.remove(...currentClassNames.current);
    }

    const classNames = [`${primaryColor}-${mode}`, mode];
    document.documentElement.classList.add(...classNames);

    currentClassNames.current = classNames;
  }, [mode, primaryColor]);

  return useMemo(
    () => ({ mode, modePreference, setModePreference, primaryColor, setPrimaryColor }),
    [mode, modePreference, primaryColor, setModePreference, setPrimaryColor],
  );
};
