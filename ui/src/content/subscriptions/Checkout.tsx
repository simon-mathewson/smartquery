import type { Address } from '@/payments/types';
import type { SubscriptionType } from '@/subscriptions/types';
import { ArrowBack } from '@mui/icons-material';
import { CheckoutProvider, PaymentElement } from '@stripe/react-stripe-js';
import { useCallback, useState } from 'react';
import { assert } from 'ts-essentials';
import { ThemeContext } from '~/content/theme/Context';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import PayButton from './PayButton';
import { stripe } from './stripe';

export type CheckoutProps = {
  address: Address | null;
  goBack: () => void;
  subscriptionType: SubscriptionType | null;
};

export const Checkout: React.FC<CheckoutProps> = (props) => {
  const { address, goBack, subscriptionType } = props;

  assert(address, 'Address is required');
  assert(subscriptionType, 'Subscription type is required');

  const { cloudApi } = useDefinedContext(CloudApiContext);

  const theme = useDefinedContext(ThemeContext);

  const [isLoading, setIsLoading] = useState(true);

  const createSession = useCallback(async () => {
    const { clientSecret } = await cloudApi.payments.createSession.mutate({
      address,
      subscriptionType,
    });

    return clientSecret;
  }, [cloudApi, address, subscriptionType]);

  return (
    <Card htmlProps={{ className: 'container max-w-[400px]' }}>
      <Header
        left={<Button htmlProps={{ onClick: goBack }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Checkout
          </div>
        }
      />
      <div className="relative flex min-h-[200px] flex-col gap-4 p-2">
        {isLoading && <Loading />}
        <CheckoutProvider
          stripe={stripe}
          options={{
            elementsOptions: { appearance: { theme: theme.mode === 'dark' ? 'night' : 'stripe' } },
            fetchClientSecret: createSession,
          }}
        >
          <PaymentElement onReady={() => setIsLoading(false)} options={{ layout: 'auto' }} />
          <PayButton />
        </CheckoutProvider>
      </div>
    </Card>
  );
};
