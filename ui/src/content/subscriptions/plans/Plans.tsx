import { plans as allPlans } from '@/subscriptions/plans';
import { formatBytes } from '@/utils/formatBytes';
import { formatDuration } from '@/utils/formatDuration';
import { formatNumber } from '@/utils/formatNumber';
import { ArrowBack, ArrowForward, Close, Done } from '@mui/icons-material';
import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../../auth/Context';
import { omit } from 'lodash';
import { Cell } from './Cell';
import { routes } from '~/router/routes';
import { useLocation } from 'wouter';
import { AnalyticsContext } from '~/content/analytics/Context';

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

  const planNames = Object.keys(plans) as (keyof typeof plans)[];

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
      <div
        className="relative grid w-full overflow-x-auto pt-2 text-sm"
        style={{
          gridTemplateColumns: `200px repeat(${planNames.length}, 150px)`,
        }}
      >
        <Cell feature />
        {planNames.map((plan) => (
          <Cell className="text-md" key={plan}>
            <div className="font-medium text-textPrimary">
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </div>
            {plans[plan].price && (
              <div>
                <span className="text-textTertiary">${plans[plan].price}</span>
                <span className="text-textTertiary">/mo</span>
              </div>
            )}
          </Cell>
        ))}
        <div className="col-span-full mx-2 my-1 h-px border-b border-border" />
        <Cell feature>
          <div>
            <div>AI Credits</div>
            <div className="mt-1 font-normal text-textTertiary">Chat & inline completions</div>
          </div>
        </Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            {formatNumber(plans[plan].limits.aiCredits)}
          </Cell>
        ))}
        <Cell feature>SmartQuery Link queries</Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            Unlimited
          </Cell>
        ))}
        <Cell feature>Cloud queries</Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            {formatBytes(plans[plan].limits.totalQueryResponseBytes)} /{' '}
            {formatDuration(plans[plan].limits.totalQueryDurationMilliseconds)}
          </Cell>
        ))}
        <Cell feature>Concurrent connections</Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            {plans[plan].limits.concurrentConnections}
          </Cell>
        ))}
        <Cell feature>Change theme color</Cell>
        {planNames.map((plan) => (
          <Cell className="pl-1" key={plan}>
            {plan === 'free' ? (
              <Close className="text-danger" />
            ) : (
              <Done className="text-success" />
            )}
          </Cell>
        ))}
        <Cell feature>Support the development of SmartQuery</Cell>
        {planNames.map((plan) => (
          <Cell className="pl-1" key={plan}>
            {plan === 'free' ? (
              <Close className="text-danger" />
            ) : (
              <Done className="text-success" />
            )}
          </Cell>
        ))}
        <Cell feature />
        {planNames.map((plan) => (
          <Cell className="!p-0" key={plan}>
            <Button
              htmlProps={{
                disabled:
                  user?.activeSubscription?.type === plan ||
                  (user !== null && !user.activeSubscription && plan === 'free'),
                className: 'w-full',
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
          </Cell>
        ))}
      </div>
    </>
  );
};
