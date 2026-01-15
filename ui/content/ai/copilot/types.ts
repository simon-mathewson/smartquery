import type { SavedQuery } from '@/savedQueries/types';
import type { QueryResult } from '~/shared/types';

export type CopilotQuery = Omit<SavedQuery, 'id'> & { result?: QueryResult };

export type ThreadMessage = string | CopilotQuery;
