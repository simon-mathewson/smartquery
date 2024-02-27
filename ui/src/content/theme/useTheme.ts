import { useCallback, useEffect, useState } from 'react';
import { useLocalStorageState } from '~/shared/hooks/useLocalStorageState';
import type { ThemeMode } from './types';
import { themes } from '../../../tailwind.config';

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

  const addOrCreateThemeColorMetaTag = useCallback((color: string) => {
    const themeColorMetaTag =
      document.querySelector('meta[name="theme-color"]') ?? document.createElement('meta');

    themeColorMetaTag.setAttribute('name', 'theme-color');
    themeColorMetaTag.setAttribute('content', color);

    document.head.appendChild(themeColorMetaTag);
  }, []);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      addOrCreateThemeColorMetaTag(themes.dark.background);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      addOrCreateThemeColorMetaTag(themes.light.background);
    }
  }, [addOrCreateThemeColorMetaTag, mode]);

  return { mode };
};
