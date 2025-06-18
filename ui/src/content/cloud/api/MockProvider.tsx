import type { MockProviderProps } from '~/providers/MockProviderProps';
import { type CloudApiClient } from './client';
import { CloudApiContext } from './Context';

export const CloudApiMockProvider: React.FC<MockProviderProps<CloudApiClient | null>> = (props) => {
  const { children, overrides } = props;

  return (
    <CloudApiContext.Provider value={{ ...overrides } as unknown as CloudApiClient}>
      {children}
    </CloudApiContext.Provider>
  );
};
