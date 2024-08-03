import type { PropsWithChildren } from 'react';
import { QueryContext, ResultContext } from './Context';
import type { Query } from '~/shared/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { QueriesContext } from '../Context';

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

  const result = query.id in queryResults ? queryResults[query.id] : null;

  return (
    <QueryContext.Provider value={contextValue}>
      <ResultContext.Provider value={result}>{children}</ResultContext.Provider>
    </QueryContext.Provider>
  );
};
