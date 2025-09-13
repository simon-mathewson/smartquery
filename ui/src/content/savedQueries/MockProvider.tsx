import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { SavedQueriesContextType } from './Context';
import { SavedQueriesContext } from './Context';

export const SavedQueriesMockProvider: React.FC<MockProviderProps<SavedQueriesContextType>> = ({
  children,
  overrides,
}) => (
  <SavedQueriesContext.Provider
    value={Object.assign(
      {
        isLoading: false,
        savedQueries: [],
        createSavedQuery: async () => {},
        deleteSavedQuery: async () => {},
        refetchSavedQueries: async () => {},
        updateSavedQuery: async () => {},
      },
      overrides,
    )}
  >
    {children}
  </SavedQueriesContext.Provider>
);
