import type { SavedQuery } from '@/savedQueries/types';
import { getQueryTitle } from '~/content/tabs/queries/query/utils';
import type { QueryResult, Tab } from '~/shared/types';

export const getTabTitle = (
  tab: Tab,
  queryResults: Record<string, QueryResult>,
  savedQueries: SavedQuery[],
) => {
  const queries = tab.queries.flat();

  if (!queries.length) {
    return 'New tab';
  }

  const result = queryResults[queries[0].id];
  const savedQuery =
    savedQueries.find((savedQuery) => savedQuery.id === queries[0].savedQueryId) ?? null;

  return getQueryTitle(queries[0], result, savedQuery);
};
