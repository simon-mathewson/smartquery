import { getQueryTitle } from '~/content/tabs/queries/query/utils';
import type { QueryResult, Tab } from '~/shared/types';

export const getTabTitle = (tab: Tab, queryResults: Record<string, QueryResult>) => {
  const queries = tab.queries.flat();

  if (!queries.length) {
    return 'New tab';
  }

  const result = queryResults[queries[0].id];

  return getQueryTitle(queries[0], result);
};
