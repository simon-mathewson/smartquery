import type { SubscriptionType } from '@/subscriptions/types';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../../cloud/api/Context';
import { useEffect } from 'react';

export type TotalProps = {
  subscriptionType: SubscriptionType;
  onReady: () => void;
};

export const Total: React.FC<TotalProps> = (props) => {
  const { subscriptionType, onReady } = props;

  const { cloudApi } = useDefinedContext(CloudApiContext);

  const { results } = useCloudQuery(() =>
    cloudApi.subscriptions.getCheckoutPrice.mutate({ subscriptionType }),
  );

  useEffect(() => {
    if (results) {
      onReady();
    }
  }, [onReady, results]);

  if (!results) {
    return null;
  }

  const items = [
    ...(results.proration
      ? [
          {
            label: `Prorated amount until ${results.proration.until.toLocaleDateString('en-US')}`,
            value: `$${results.proration.price / 100}`,
          },
        ]
      : []),
    {
      label: results.proration ? 'Future price' : 'Total',
      value: `$${results.futurePrice / 100}/mo.`,
    },
  ];

  return (
    <div className="flex flex-col gap-2 py-2">
      {items.map((item) => (
        <div key={item.label} className="flex justify-between">
          <div className="text-md font-medium text-textSecondary">{item.label}</div>
          <div className="text-md font-medium text-textSecondary">{item.value}</div>
        </div>
      ))}
    </div>
  );
};
