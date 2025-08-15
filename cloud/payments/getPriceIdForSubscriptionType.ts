import type { SubscriptionType } from '@/subscriptions/types';

export const getPriceIdForSubscriptionType = (subscriptionType: SubscriptionType) => {
  switch (subscriptionType) {
    case 'plus':
      return process.env.STRIPE_PLUS_PRICE_ID;
    case 'pro':
      return process.env.STRIPE_PRO_PRICE_ID;
  }
};
