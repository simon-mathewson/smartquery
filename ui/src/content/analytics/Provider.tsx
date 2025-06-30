import type { PropsWithChildren } from 'react';
import { AnalyticsContext } from './Context';
import { useAnalytics } from './useAnalytics';

export const AnalyticsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useAnalytics();

  return <AnalyticsContext.Provider value={context}>{children}</AnalyticsContext.Provider>;
};
