import { plans } from '@/subscriptions/plans';
import type { CurrentUser } from '@/user/types';

export const getLimitsForUser = (user: CurrentUser | null) =>
  plans[user ? user.activeSubscription?.type ?? 'free' : 'anonymous'].limits;
