import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { ErrorTrackingContextType } from './Context';
import { ErrorTrackingContext } from './Context';

export const ErrorTrackingMockProvider: React.FC<MockProviderProps<ErrorTrackingContextType>> = (
  props,
) => {
  const { children, overrides } = props;

  return (
    <ErrorTrackingContext.Provider
      value={Object.assign(
        {
          isConsentGranted: false,
          setIsConsentGranted: () => {},
          trackError: () => {},
        },
        overrides,
      )}
    >
      {children}
    </ErrorTrackingContext.Provider>
  );
};
