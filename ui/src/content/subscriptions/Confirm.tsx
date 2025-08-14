import type { SubscriptionType } from '@/subscriptions/types';
import { ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { useEffect, useRef } from 'react';
import { assert } from 'ts-essentials';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';

export type ConfirmProps = {
  goBack: () => void;
  subscriptionType: SubscriptionType | null;
};

export const Confirm: React.FC<ConfirmProps> = (props) => {
  const { goBack, subscriptionType } = props;

  assert(subscriptionType, 'Subscription type is required');

  const { getCurrentUser, user } = useDefinedContext(AuthContext);

  const subscriptionConfirmed = user?.subscription?.type === subscriptionType;

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (subscriptionConfirmed) {
      return;
    }

    const interval = setInterval(() => {
      void getCurrentUser();
    }, 1000) as unknown as number;

    intervalRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Card htmlProps={{ className: 'container max-w-[400px]' }}>
      <Header
        left={<Button htmlProps={{ onClick: goBack }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Payment Confirmation
          </div>
        }
      />
      <div className="relative flex min-h-[200px] flex-col gap-4 p-2">
        <div className="flex items-center justify-center gap-2 py-20">
          {!subscriptionConfirmed ? (
            <>
              <CircularProgress size={24} />
              <div className="text-center text-sm text-textSecondary">
                Waiting for payment confirmation
              </div>
            </>
          ) : (
            <>
              <CheckCircleOutline className="text-success" />
              <div className="text-center text-sm text-textSecondary">Payment successful</div>
            </>
          )}
        </div>
        {subscriptionConfirmed && (
          <Button
            element="link"
            htmlProps={{ href: routes.root() }}
            label="Go home"
            variant="filled"
          />
        )}
      </div>
    </Card>
  );
};
