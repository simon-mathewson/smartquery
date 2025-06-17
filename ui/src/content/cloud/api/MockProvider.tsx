import type { MockProviderProps } from '~/providers/MockProviderProps';
import { type CloudApiClient } from './client';
import { CloudApiContext } from './Context';

export const CloudApiMockProvider: React.FC<MockProviderProps<CloudApiClient | null>> = (props) => {
  const { children, mockOverride } = props;

  return (
    <CloudApiContext.Provider value={{ ...mockOverride } as unknown as CloudApiClient}>
      {children}
    </CloudApiContext.Provider>
  );
};
