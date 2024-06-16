import type { PropsWithChildren } from 'react';
import React from 'react';
import { ThemeProvider } from '~/content/theme/Provider';
import { useTheme } from '~/content/theme/useTheme';
import { ErrorBoundary } from '../content/errorBoundary/ErrorBoundary';
import { ToastProvider } from '../content/toast/Provider';
import { ClickOutsideQueueProvider } from '../shared/hooks/useClickOutside/useQueue/Provider';

export const BaseProviders: React.FC<PropsWithChildren> = ({ children }) => {
  useTheme();

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ClickOutsideQueueProvider>
          <ToastProvider>{children}</ToastProvider>
        </ClickOutsideQueueProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
