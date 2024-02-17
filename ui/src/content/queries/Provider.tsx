import type { PropsWithChildren } from 'react';
import { useQueries } from './useQueries';
import { QueriesContext } from './Context';

export const QueriesProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useQueries();

  return <QueriesContext.Provider value={context}>{children}</QueriesContext.Provider>;
};
