import { type SubscriptionType } from '@/subscriptions/types';
import { useLocation, useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { routes } from '~/router/routes';
import { Confirm } from './Confirm';
import { assert } from 'ts-essentials';

export const SubscribeConfirmPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();

  const subscriptionType = searchParams.get('type') as SubscriptionType;
  assert(subscriptionType, 'Subscription type is required');

  return (
    <Page title="Subscribe">
      <Confirm
        goBack={() => navigate(routes.subscribeCheckout(subscriptionType))}
        subscriptionType={subscriptionType}
      />
    </Page>
  );
};
