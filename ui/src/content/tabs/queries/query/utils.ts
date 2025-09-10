import type { Query, QueryResult } from '~/shared/types';
import type { SavedQuery } from '@/savedQueries/types';

export const getQueryTitle = (
  query: Query,
  result: QueryResult | null,
  savedQuery: SavedQuery | null,
) => savedQuery?.name ?? query.select?.table ?? result?.table ?? 'New query';
