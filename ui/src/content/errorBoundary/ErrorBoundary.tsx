import type { PropsWithChildren } from 'react';
import React from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorBoundaryFallback } from './Fallback';
import { ThemeProvider } from '../theme/Provider';
import { AiMockProvider } from '../ai/MockProvider';
import { AnalyticsMockProvider } from '../analytics/MockProvider';

export const ErrorBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    // The error boundary wraps the entire app including providers to catch all errors.
    // Therefore the theme provider is needed here again to render the error boundary.
    <ThemeProvider>
      {/* Also include AI and analytics mock providers to satisfy code editor */}
      <AnalyticsMockProvider>
        <AiMockProvider>
          <ReactErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
            {children}
          </ReactErrorBoundary>
        </AiMockProvider>
      </AnalyticsMockProvider>
    </ThemeProvider>
  );
};
