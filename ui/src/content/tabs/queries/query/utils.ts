import type { Query, QueryResult } from '~/shared/types';
import type { SavedQuery } from '@/savedQueries/types';

export const getQueryTitle = (
  query: Query,
  result: QueryResult | null,
  savedQuery: SavedQuery | null,
) =>
  savedQuery?.name ??
  query.name ??
  query.select?.tables[0].originalName ??
  result?.tables.at(0)?.originalName ??
  'New query';
