import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { AnalyticsContextType } from './Context';
import { AnalyticsContext } from './Context';

export const AnalyticsMockProvider: React.FC<MockProviderProps<AnalyticsContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <AnalyticsContext.Provider
      value={Object.assign(
        {
          isConsentGranted: false,
          allow: () => {},
          deny: () => {},
          track: () => {},
        },
        overrides,
      )}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
