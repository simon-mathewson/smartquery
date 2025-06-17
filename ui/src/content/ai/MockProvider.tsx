import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { useAi } from './useAi';
import { AiContext } from './Context';

export const AiMockProvider: React.FC<MockProviderProps<ReturnType<typeof useAi>>> = (props) => {
  const { children, mockOverride } = props;

  return (
    <AiContext.Provider
      value={{
        googleAi: null,
        googleAiApiKey: undefined,
        setGoogleAiApiKey: () => {},
        ...mockOverride,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};
