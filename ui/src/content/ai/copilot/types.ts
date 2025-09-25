import type { SavedQuery } from '@/savedQueries/types';

export type ThreadMessage = string | Omit<SavedQuery, 'id'>;
