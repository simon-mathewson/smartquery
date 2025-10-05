import { createContext } from 'react';
import type { useAnalytics } from './useAnalytics';

export type AnalyticsContextType = ReturnType<typeof useAnalytics>;

export const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

AnalyticsContext.displayName = 'AnalyticsContext';
