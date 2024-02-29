import { getQueryTitle } from '~/content/tabs/Queries/Query/utils';
import type { Tab } from '~/shared/types';

export const getTabTitle = (tab: Tab) => {
  const queries = tab.queries.flat();

  return !queries.length ? 'New tab' : getQueryTitle(queries[0]);
};
