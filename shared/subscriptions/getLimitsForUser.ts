import { plans } from '@/subscriptions/plans';
import type { CurrentUser } from '@/user/user';

export const getLimitsForUser = (user: CurrentUser) =>
  plans[user.subscription?.type ?? 'free'].limits;
