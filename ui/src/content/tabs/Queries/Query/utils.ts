import type { Query } from '~/shared/types';

export const getQueryTitle = (query: Query) => query.table ?? 'New query';
