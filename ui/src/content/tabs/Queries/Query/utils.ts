import type { QueryResult } from '~/shared/types';

export const getQueryTitle = (result: QueryResult | null) => result?.table ?? 'New query';
