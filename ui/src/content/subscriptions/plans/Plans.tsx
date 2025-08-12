import { plans } from '@/subscriptions/plans';
import { formatBytes } from '@/utils/formatBytes';
import { formatDuration } from '@/utils/formatDuration';
import { formatNumber } from '@/utils/formatNumber';
import { ArrowBack, ArrowForward, Close, Done } from '@mui/icons-material';
import classNames from 'classnames';
import React from 'react';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';

export const Plans: React.FC = () => {
  const planNames = Object.keys(plans) as (keyof typeof plans)[];

  const Cell = ({
    children,
    className,
    feature,
  }: {
    children?: React.ReactNode;
    className?: string;
    feature?: boolean;
  }) => (
    <div
      className={classNames('flex w-full items-center gap-2 p-2', className, {
        'sticky left-0 z-10 bg-card text-xs font-medium text-textPrimary': feature,
      })}
    >
      {children}
    </div>
  );

  return (
    <Card htmlProps={{ className: 'mx-2 container max-w-max' }}>
      <Header
        left={<Button element="link" htmlProps={{ href: routes.root() }} icon={<ArrowBack />} />}
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            Subscribe
          </div>
        }
      />
      <div className="relative grid w-full grid-cols-[150px_150px_150px_150px] overflow-x-auto pt-2 text-sm">
        <Cell feature />
        {planNames.map((plan) => (
          <Cell className="text-md" key={plan}>
            <div className="font-medium text-textPrimary">
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </div>
            {plans[plan].price && (
              <div>
                <span className="text-textTertiary">${plans[plan].price.usd}</span>
                <span className="text-textTertiary">/mo</span>
              </div>
            )}
          </Cell>
        ))}
        <div className="col-span-full mx-2 my-1 h-px border-b border-border" />
        <Cell feature>AI Credits</Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            {formatNumber(plans[plan].limits.aiCredits)}
          </Cell>
        ))}
        <Cell feature>Dabase Link queries</Cell>
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
        <Cell feature>Concurrent queries</Cell>
        {planNames.map((plan) => (
          <Cell className="text-textSecondary" key={plan}>
            {plans[plan].limits.concurrentQueryStatements}
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
        <Cell feature />
        {planNames.map((plan) => (
          <Cell className="!p-0" key={plan}>
            {plan !== 'free' && (
              <Button
                htmlProps={{ className: 'w-full' }}
                icon={<ArrowForward />}
                label="Continue"
              />
            )}
          </Cell>
        ))}
      </div>
    </Card>
  );
};
