import { createContext } from 'react';
import type { useErrorTracking } from './useErrorTracking';

export type ErrorTrackingContextType = ReturnType<typeof useErrorTracking>;

export const ErrorTrackingContext = createContext<ErrorTrackingContextType | null>(null);

ErrorTrackingContext.displayName = 'ErrorTrackingContext';
