import { useState } from 'react';
import { Page } from '~/shared/components/page/Page';
import { Signup } from '../auth/Signup/Signup';
import { Plans } from './plans/Plans';

export const SubscribePage: React.FC = () => {
  const [stage, setStage] = useState<'plans' | 'signup' | 'checkout'>('plans');

  return (
    <Page title="Subscribe">
      {stage === 'plans' && <Plans />}
      {stage === 'signup' && <Signup onSuccess={() => setStage('checkout')} />}
      {stage === 'checkout' && <div>Checkout</div>}
    </Page>
  );
};
