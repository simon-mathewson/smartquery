import { subscriptionTypeSchema, type SubscriptionType } from '@/subscriptions/types';
import { useState } from 'react';
import { useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { Signup } from '../auth/Signup/Signup';
import { Checkout } from './Checkout/Checkout';
import { Confirm } from './Confirm';
import { Plans } from './Plans';
import { AuthContext } from '../auth/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export const SubscribePage: React.FC = () => {
  const { user } = useDefinedContext(AuthContext);

  const [searchParams] = useSearchParams();

  const subscriptionToConfirmParam = searchParams.get('confirm');
  const subscriptionToConfirm = subscriptionToConfirmParam
    ? subscriptionTypeSchema.parse(subscriptionToConfirmParam)
    : null;

  const [stage, setStage] = useState<'plans' | 'signup' | 'checkout' | 'confirm'>(
    subscriptionToConfirm ? 'confirm' : 'plans',
  );
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(
    subscriptionToConfirm,
  );

  return (
    <Page title="Subscribe">
      {stage === 'plans' && (
        <Plans
          onContinue={(type) => {
            setSubscriptionType(type);
            setStage(user ? 'checkout' : 'signup');
          }}
        />
      )}
      {stage === 'signup' && <Signup onSuccess={() => setStage('checkout')} />}
      {stage === 'checkout' && (
        <Checkout goBack={() => setStage('plans')} subscriptionType={subscriptionType} />
      )}
      {stage === 'confirm' && (
        <Confirm goBack={() => setStage('checkout')} subscriptionType={subscriptionType} />
      )}
    </Page>
  );
};
