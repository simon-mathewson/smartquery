import type { Address } from '@/payments/types';
import { subscriptionTypeSchema, type SubscriptionType } from '@/subscriptions/types';
import { useState } from 'react';
import { useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { Signup } from '../auth/Signup/Signup';
import { Address as AddressForm } from './Address';
import { Checkout } from './Checkout';
import { Confirm } from './Confirm';
import { Plans } from './Plans';

export const SubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const subscriptionToConfirmParam = searchParams.get('confirm');
  const subscriptionToConfirm = subscriptionToConfirmParam
    ? subscriptionTypeSchema.parse(subscriptionToConfirmParam)
    : null;

  const [stage, setStage] = useState<'plans' | 'signup' | 'address' | 'checkout' | 'confirm'>(
    subscriptionToConfirm ? 'confirm' : 'plans',
  );
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(
    subscriptionToConfirm,
  );
  const [address, setAddress] = useState<Address | null>(null);

  return (
    <Page title="Subscribe">
      {stage === 'plans' && (
        <Plans
          onContinue={(type) => {
            setSubscriptionType(type);
            setStage('signup');
          }}
        />
      )}
      {stage === 'signup' && <Signup onSuccess={() => setStage('address')} />}
      {stage === 'address' && (
        <AddressForm
          goBack={() => setStage('plans')}
          onContinue={(address) => {
            setAddress(address);
            setStage('checkout');
          }}
          value={address}
        />
      )}
      {stage === 'checkout' && (
        <Checkout
          address={address}
          goBack={() => setStage('address')}
          subscriptionType={subscriptionType}
        />
      )}
      {stage === 'confirm' && (
        <Confirm goBack={() => setStage('signup')} subscriptionType={subscriptionType} />
      )}
    </Page>
  );
};
