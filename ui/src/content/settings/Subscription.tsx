import { plans } from '@/subscriptions/plans';
import { CancelOutlined, SettingsBackupRestoreOutlined } from '@mui/icons-material';
import React from 'react';
import { assert } from 'ts-essentials';
import { Button } from '~/shared/components/button/Button';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { CloudApiContext } from '../cloud/api/Context';
import { ToastContext } from '../toast/Context';

export type SubscriptionProps = {
  close: () => void;
};

export const Subscription: React.FC<SubscriptionProps> = () => {
  const toast = useDefinedContext(ToastContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const { user, getCurrentUser } = useDefinedContext(AuthContext);

  assert(user?.activeSubscription, 'User must have an active subscription');

  const { startDate, stripeSubscriptionId, type, endDate } = user.activeSubscription;
  const subscriptionName = `${type[0].toUpperCase()}${type.slice(1)}`;

  const price = stripeSubscriptionId ? plans[type].price : null;

  const items = [
    { label: 'Plan', value: subscriptionName },
    ...(price ? [{ label: 'Price', value: `$${price}/mo` }] : []),
    {
      label: 'Subscribed since',
      value: startDate.toLocaleDateString('en-US'),
    },
    ...(endDate ? [{ label: 'Expires on', value: endDate.toLocaleDateString('en-US') }] : []),
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
          {/* <Button
            align="left"
            element="link"
            htmlProps={{
              href: routes.subscribePlans(),
              onClick: () => {
                close();
              },
            }}
            icon={<EditOutlined />}
            label="Change plan"
          /> */}
          {!endDate ? (
            <ConfirmDeletePopover
              onConfirm={async () => {
                await cloudApi.subscriptions.cancelSubscription.mutate();
                toast.add({
                  title: 'Subscription cancelled',
                  color: 'success',
                });

                setTimeout(() => {
                  void getCurrentUser();
                }, 1000);
              }}
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
          ) : (
            <ConfirmDeletePopover
              onConfirm={async () => {
                await cloudApi.subscriptions.reactivateSubscription.mutate();
                toast.add({
                  title: 'Subscription reactivated',
                  color: 'success',
                });

                setTimeout(() => {
                  void getCurrentUser();
                }, 1000);
              }}
              renderTrigger={(htmlProps) => (
                <Button
                  align="left"
                  icon={<SettingsBackupRestoreOutlined />}
                  label="Reactivate subscription"
                  htmlProps={htmlProps}
                />
              )}
              text="Confirm reactivation"
            />
          )}
        </>
      )}
    </div>
  );
};
