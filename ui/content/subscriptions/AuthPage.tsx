import { useLocation, useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { routes } from '~/router/routes';
import { Auth } from './Auth';
import type { SubscriptionType } from '@/subscriptions/types';
import { assert } from 'ts-essentials';

export const SubscribeAuthPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();

  const subscriptionType = searchParams.get('type') as SubscriptionType | null;
  assert(subscriptionType, 'Subscription type is required');

  return (
    <Page title="Subscribe" htmlProps={{ className: 'max-w-none' }}>
      <Auth
        onBack={() => navigate(routes.subscribePlans())}
        onSuccess={() => navigate(`${routes.subscribeCheckout(subscriptionType)}`)}
      />
    </Page>
  );
};
