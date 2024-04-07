import type { Query, QueryResult } from '~/shared/types';

export const getQueryTitle = (query: Query, result: QueryResult | null) =>
  query.select?.table ?? result?.table ?? 'New query';
