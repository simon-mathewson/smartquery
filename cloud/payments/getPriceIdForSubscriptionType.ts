import type { SubscriptionType } from '@/subscriptions/types';

export const getPriceIdForSubscriptionType = (subscriptionType: SubscriptionType) => {
  switch (subscriptionType) {
    case 'plus':
      return process.env.STRIPE_PRICE_ID_PLUS;
    case 'pro':
      return process.env.STRIPE_PRICE_ID_PRO;
  }
};
