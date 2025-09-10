import type { PropsWithChildren } from 'react';
import { useSavedQueries } from './useSavedQueries';
import { SavedQueriesContext } from './Context';

export const SavedQueriesProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useSavedQueries();

  return <SavedQueriesContext.Provider value={context}>{children}</SavedQueriesContext.Provider>;
};
