import './index.css';

import React from 'react';
import { SettingsOverlay } from './content/settings/Overlay';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { useTheme } from './content/theme/useTheme';
import { Providers } from './providers/Providers';

export const App: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  useTheme();

  return (
    <ErrorBoundary>
      <Providers>
        {children}
        <SettingsOverlay />
      </Providers>
    </ErrorBoundary>
  );
};
