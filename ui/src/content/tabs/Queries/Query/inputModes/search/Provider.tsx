import type { PropsWithChildren } from 'react';
import { useSearch } from './useSearch';
import { SearchContext } from './Context';
import type { Query } from '~/shared/types';

export type SearchProviderProps = PropsWithChildren<{
  query: Query;
}>;

export const SearchProvider: React.FC<SearchProviderProps> = (props) => {
  const { children, query } = props;

  const context = useSearch(query);

  return <SearchContext.Provider value={context}>{children}</SearchContext.Provider>;
};
