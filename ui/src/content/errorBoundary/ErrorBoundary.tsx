import type { PropsWithChildren } from 'react';
import React from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorBoundaryFallback } from './Fallback';

export const ErrorBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorBoundaryFallback}>{children}</ReactErrorBoundary>
  );
};
