import type { PropsWithChildren } from 'react';
import React from 'react';
import { useErrorTracking } from './useErrorTracking';
import { ErrorTrackingContext } from './Context';
import { ErrorBoundary } from '../boundary/ErrorBoundary';

export const ErrorTrackingProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const errorTracking = useErrorTracking();

  return (
    <ErrorTrackingContext.Provider value={errorTracking}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ErrorTrackingContext.Provider>
  );
};
