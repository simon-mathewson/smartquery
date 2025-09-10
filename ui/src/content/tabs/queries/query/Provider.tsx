import type { PropsWithChildren } from 'react';
import { QueryContext, ResultContext, SavedQueryContext } from './Context';
import type { Query } from '~/shared/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../Context';
import { SavedQueriesContext } from '~/content/savedQueries/Context';

export type QueryContextValue = {
  columnIndex: number;
  query: Query;
  rowIndex: number;
};

export type QueryProviderProps = PropsWithChildren<QueryContextValue>;

export const QueryProvider: React.FC<QueryProviderProps> = (props) => {
  const { children, ...contextValue } = props;
  const { query } = contextValue;

  const { queryResults } = useDefinedContext(QueriesContext);
  const { savedQueries } = useDefinedContext(SavedQueriesContext);

  const result = query.id in queryResults ? queryResults[query.id] : null;
  const savedQuery = query.savedQueryId
    ? savedQueries?.find((savedQuery) => savedQuery.id === query.savedQueryId) ?? null
    : null;

  return (
    <QueryContext.Provider value={contextValue}>
      <ResultContext.Provider value={result}>
        <SavedQueryContext.Provider value={savedQuery}>{children}</SavedQueryContext.Provider>
      </ResultContext.Provider>
    </QueryContext.Provider>
  );
};
