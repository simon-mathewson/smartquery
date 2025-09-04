import { type SubscriptionType } from '@/subscriptions/types';
import { useState } from 'react';
import { useLocation, useSearchParams } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { Signup } from '../auth/Signup/Signup';
import { Checkout } from './Checkout/Checkout';
import { Confirm } from './Confirm';
import { Plans } from './plans/Plans';
import { routes } from '~/router/routes';
import { Card } from '~/shared/components/card/Card';

type Stage = 'plans' | 'signup' | 'checkout' | 'confirm';

export const SubscribePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useDefinedContext(AuthContext);

  const [searchParams] = useSearchParams();

  const subscriptionStageParam = searchParams.get('stage') as Stage | null;
  const subscriptionTypeParam = searchParams.get('type') as SubscriptionType | null;

  const [stage, setStage] = useState<Stage>(subscriptionStageParam ?? 'plans');
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(
    subscriptionTypeParam,
  );

  return (
    <Page title="Subscribe" htmlProps={{ className: 'max-w-max' }}>
      {stage === 'plans' && (
        <Card htmlProps={{ className: 'container max-w-max' }}>
          <Plans
            onBack={() => navigate(routes.root())}
            onContinue={(type) => {
              if (type === 'free') {
                navigate(routes.signup());
                return;
              }

              setSubscriptionType(type);
              setStage(user ? 'checkout' : 'signup');
            }}
          />
        </Card>
      )}
      {stage === 'signup' && (
        <Signup onBack={() => setStage('plans')} onSuccess={() => setStage('checkout')} />
      )}
      {stage === 'checkout' && (
        <Checkout goBack={() => setStage('plans')} subscriptionType={subscriptionType} />
      )}
      {stage === 'confirm' && (
        <Confirm goBack={() => setStage('checkout')} subscriptionType={subscriptionType} />
      )}
    </Page>
  );
};
