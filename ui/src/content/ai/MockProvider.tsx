import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { AiContextType } from './Context';
import { AiContext } from './Context';

export const AiMockProvider: React.FC<MockProviderProps<AiContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <AiContext.Provider
      value={Object.assign(
        {
          enabled: false,
          generateChatResponse: async function* () {
            yield null;
            return null;
          },
          generateInlineCompletions: async () => null,
          googleAiApiKey: undefined,
          setGoogleAiApiKey: () => {},
        } satisfies AiContextType,
        overrides,
      )}
    >
      {children}
    </AiContext.Provider>
  );
};
