import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { CloudApiContextType } from './Context';
import { CloudApiContext } from './Context';

export const CloudApiMockProvider: React.FC<MockProviderProps<CloudApiContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <CloudApiContext.Provider
      value={Object.assign(
        {
          cloudApi: {},
          cloudApiStream: {},
        } as CloudApiContextType,
        overrides,
      )}
    >
      {children}
    </CloudApiContext.Provider>
  );
};
