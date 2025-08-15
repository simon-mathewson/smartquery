import { plans } from '@/subscriptions/plans';
import type { CurrentUser } from '@/user/types';

export const getLimitsForUser = (user: CurrentUser) =>
  plans[user.activeSubscription?.type ?? 'free'].limits;
