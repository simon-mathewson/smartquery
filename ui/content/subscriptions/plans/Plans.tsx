import { plans as allPlans } from '@/subscriptions/plans';
import { formatNumber } from '@/utils/formatNumber';
import { ArrowBack, ArrowForward, Close, Done } from '@mui/icons-material';
import { omit } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AnalyticsContext } from '~/content/analytics/Context';
import { isReactNative, useNative } from '~/content/native/useNative';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../../auth/Context';

const plans = omit(allPlans, 'pro', 'anonymous');

export type PlansProps = {
  onBack?: () => void;
  afterContinue?: () => void;
};

export const Plans: React.FC<PlansProps> = (props) => {
  const { onBack, afterContinue } = props;

  const [, navigate] = useLocation();
  const { user } = useDefinedContext(AuthContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const native = useNative();

  const planNames = Object.keys(plans) as (keyof typeof plans)[];

  const [planPrices, setPlanPrices] = useState<(string | null)[] | null>(null);

  useEffect(() => {
    void Promise.all(
      planNames.map((plan) => {
        if (plan === 'free') return null;

        if (isReactNative) {
          return native.getSubscriptionPrice(plan);
        }

        return `$${plans[plan].webPrice}`;
      }),
    ).then(setPlanPrices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header
        left={
          onBack && <Button element="link" htmlProps={{ onClick: onBack }} icon={<ArrowBack />} />
        }
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Plans
          </div>
        }
      />
      <div className="flex w-full flex-col gap-1 p-2">
        {planNames.map((plan, index) => (
          <div className="flex flex-col gap-3" key={plan}>
            <div className="mb-1 flex items-baseline gap-2">
              <h1 className="text-xl font-medium text-textPrimary">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </h1>
              {planPrices?.[index] && (
                <div>
                  <span className="text-textTertiary">{planPrices[index]}</span>
                  <span className="text-textTertiary">/mo</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
              <div className="self-start text-center text-sm font-medium text-textPrimary">
                {formatNumber(plans[plan].limits.aiCredits)}
              </div>
              <div>
                <div className="text-sm">AI Credits (per month)</div>
                <div className="mt-1 text-xs font-normal text-textTertiary">
                  Chat & inline completions
                </div>
              </div>
              {plan === 'free' ? (
                <Close className="!h-5 !w-5 text-danger" />
              ) : (
                <Done className="!h-4 !w-4 text-success" />
              )}
              <div className="text-sm">Change theme color</div>
              {plan === 'free' ? (
                <Close className="!h-5 !w-5 text-danger" />
              ) : (
                <Done className="!h-4 !w-4 text-success" />
              )}
              <div className="text-sm">Support the development of SmartQuery</div>
            </div>
            <Button
              htmlProps={{
                disabled:
                  user?.activeSubscription?.type === plan ||
                  (user !== null && !user.activeSubscription && plan === 'free'),
                className: 'ml-auto',
                onClick: () => {
                  track('subscribe_plans_continue', { plan });

                  if (plan === 'free') {
                    navigate(routes.signup());
                    return;
                  }

                  if (user) {
                    navigate(routes.subscribeCheckout(plan), { replace: false });
                  } else {
                    navigate(routes.subscribeAuth(plan), { replace: false });
                  }

                  afterContinue?.();
                },
              }}
              icon={<ArrowForward />}
              label="Continue"
              tooltip={
                user?.activeSubscription?.type === plan ? 'You are already on this plan' : undefined
              }
            />
          </div>
        ))}
      </div>
    </>
  );
};
