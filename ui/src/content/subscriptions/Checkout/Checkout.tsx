import type { SubscriptionType } from '@/subscriptions/types';
import { ArrowBack } from '@mui/icons-material';
import { AddressElement, CheckoutProvider, PaymentElement } from '@stripe/react-stripe-js';
import { useCallback, useState } from 'react';
import { assert } from 'ts-essentials';
import { ThemeContext } from '~/content/theme/Context';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../../cloud/api/Context';
import PayButton from '../PayButton';
import { stripe } from '../stripe';
import { Total } from './Total';
import { Toggle } from '~/shared/components/toggle/Toggle';

export type CheckoutProps = {
  goBack: () => void;
  subscriptionType: SubscriptionType | null;
};

export const Checkout: React.FC<CheckoutProps> = (props) => {
  const { goBack, subscriptionType } = props;

  assert(subscriptionType, 'Subscription type is required');

  const { cloudApi } = useDefinedContext(CloudApiContext);

  const theme = useDefinedContext(ThemeContext);

  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [isLoadingTotal, setIsLoadingTotal] = useState(true);

  const [isAddressComplete, setIsAddressComplete] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);

  const createSession = useCallback(async () => {
    const { clientSecret } = await cloudApi.subscriptions.createCheckoutSession.mutate({
      subscriptionType,
    });

    return clientSecret;
  }, [cloudApi, subscriptionType]);

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
      <div className="relative min-h-[200px] p-2">
        {(isLoadingAddress || isLoadingPayment || isLoadingTotal) && <Loading />}
        <div className="z-10 flex flex-col gap-4 bg-white">
          <CheckoutProvider
            stripe={stripe}
            options={{
              elementsOptions: {
                appearance: { theme: theme.mode === 'dark' ? 'night' : 'stripe' },
              },
              fetchClientSecret: createSession,
            }}
          >
            <AddressElement
              onChange={(event) => setIsAddressComplete(event.complete)}
              onReady={() => setIsLoadingAddress(false)}
              options={{ mode: 'billing' }}
            />
            <PaymentElement
              onChange={(event) => setIsPaymentComplete(event.complete)}
              onReady={() => setIsLoadingPayment(false)}
              options={{ layout: 'auto' }}
            />
            <Toggle
              label="I agree to the immediate execution of the contract and acknowledge that I will lose my
              right of withdrawal upon the complete fulfillment of the contract."
              value={isAgreementAccepted}
              onChange={() => setIsAgreementAccepted(!isAgreementAccepted)}
            />
            <Total subscriptionType={subscriptionType} onReady={() => setIsLoadingTotal(false)} />
            <PayButton
              disabled={!isAddressComplete || !isPaymentComplete || !isAgreementAccepted}
            />
          </CheckoutProvider>
        </div>
      </div>
    </Card>
  );
};
