import type { PropsWithChildren } from 'react';
import React from 'react';
import { ThemeProvider } from '~/content/theme/Provider';
import { useTheme } from '~/content/theme/useTheme';
import { ErrorBoundary } from '../content/errorBoundary/ErrorBoundary';
import { ToastProvider } from '../content/toast/Provider';
import { EscapeStackProvider } from '../shared/hooks/useEscape/useStack/Provider';
import { AiProvider } from '~/content/ai/Provider';
import { CopilotProvider } from '~/content/copilot/Provider';

export const BaseProviders: React.FC<PropsWithChildren> = ({ children }) => {
  useTheme();

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <EscapeStackProvider>
          <ToastProvider>
            <AiProvider>
              <CopilotProvider>{children}</CopilotProvider>
            </AiProvider>
          </ToastProvider>
        </EscapeStackProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
