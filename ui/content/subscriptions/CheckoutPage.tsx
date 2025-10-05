import { type SubscriptionType } from '@/subscriptions/types';
import { useLocation, useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { routes } from '~/router/routes';
import { Checkout } from './Checkout/Checkout';
import { assert } from 'ts-essentials';

export const SubscribeCheckoutPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();

  const subscriptionType = searchParams.get('type') as SubscriptionType | null;
  assert(subscriptionType, 'Subscription type is required');

  return (
    <Page title="Subscribe" htmlProps={{ className: 'max-w-none' }}>
      <Checkout
        goBack={() => navigate(routes.subscribePlans())}
        subscriptionType={subscriptionType}
      />
    </Page>
  );
};
