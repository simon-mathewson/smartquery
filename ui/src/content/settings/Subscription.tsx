import React from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { assert } from 'ts-essentials';
import { Button } from '~/shared/components/button/Button';
import { CancelOutlined, EditOutlined } from '@mui/icons-material';
import { plans } from '@/subscriptions/plans';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { routes } from '~/router/routes';

export type SubscriptionProps = {
  exit: () => void;
};

export const Subscription: React.FC<SubscriptionProps> = (props) => {
  const { exit } = props;

  const { user } = useDefinedContext(AuthContext);

  assert(user?.activeSubscription, 'User must have an active subscription');

  const { startDate, stripeSubscriptionId, type } = user.activeSubscription;
  const subscriptionName = `${type[0].toUpperCase()}${type.slice(1)}`;

  const price = stripeSubscriptionId ? plans[type].price : null;

  const items = [
    { label: 'Plan', value: subscriptionName },
    ...(price ? [{ label: 'Price', value: `$${price}/mo` }] : []),
    {
      label: 'Subscribed since',
      value: startDate.toLocaleDateString('en-US'),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-2">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <div className="text-sm font-medium text-textPrimary">{item.label}</div>
            <div className="text-sm text-textSecondary">{item.value}</div>
          </div>
        ))}
      </div>
      {stripeSubscriptionId && (
        <>
          <Button
            align="left"
            element="link"
            htmlProps={{
              href: routes.subscribe(),
              onClick: () => {
                exit();
              },
            }}
            icon={<EditOutlined />}
            label="Change plan"
          />
          <ConfirmDeletePopover
            onConfirm={() => {}}
            renderTrigger={(htmlProps) => (
              <Button
                align="left"
                icon={<CancelOutlined />}
                label="Cancel subscription"
                htmlProps={htmlProps}
              />
            )}
            text="Confirm cancellation"
          />
        </>
      )}
    </div>
  );
};
