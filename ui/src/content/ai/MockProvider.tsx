import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { AiContextType } from './Context';
import { AiContext } from './Context';

export const AiMockProvider: React.FC<MockProviderProps<AiContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <AiContext.Provider
      value={Object.assign(
        {
          googleAi: null,
          googleAiApiKey: undefined,
          setGoogleAiApiKey: () => {},
        },
        overrides,
      )}
    >
      {children}
    </AiContext.Provider>
  );
};
