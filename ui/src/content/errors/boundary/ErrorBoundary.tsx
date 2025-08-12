import type { PropsWithChildren } from 'react';
import React from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeProvider } from '../../theme/Provider';
import { ErrorTrackingContext } from '../tracking/Context';
import { ErrorBoundaryFallback } from './Fallback';
import { EscapeStackProvider } from '~/shared/hooks/useEscape/useStack/Provider';

export type ErrorBoundaryProps = PropsWithChildren;

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const errorTracking = useDefinedContext(ErrorTrackingContext);

  return (
    // The error boundary wraps the entire app including providers to catch all errors.
    // Therefore the theme provider is needed here again to render the error boundary.
    <ThemeProvider>
      <EscapeStackProvider>
        <ReactErrorBoundary
          FallbackComponent={ErrorBoundaryFallback}
          onError={(error) => {
            errorTracking.trackError(error);
          }}
        >
          {children}
        </ReactErrorBoundary>
      </EscapeStackProvider>
    </ThemeProvider>
  );
};
