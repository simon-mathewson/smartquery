import { getLimitsForUser } from '@/subscriptions/getLimitsForUser';
import type { CurrentUser } from '@/user/types';
import { formatBytes, getBytesUnit, getBytesValue } from '@/utils/formatBytes';
import { formatDuration, getDurationUnit, getDurationValue } from '@/utils/formatDuration';
import { formatNumber, getNumberUnit, getNumberValue } from '@/utils/formatNumber';
import React from 'react';
import { assert } from 'ts-essentials';
import { AuthContext } from '~/content/auth/Context';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { Loading } from '~/shared/components/loading/Loading';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

const getUsages = (currentUser: CurrentUser) => {
  const limits = getLimitsForUser(currentUser);

  return [
    {
      label: 'AI Credits',
      max: limits.aiCredits,
      type: 'aiCredits',
      valueType: 'number',
    },
    {
      label: 'Cloud Query Duration',
      max: limits.totalQueryDurationMilliseconds,
      type: 'queryDurationMilliseconds',
      valueType: 'duration',
    },
    {
      label: 'Cloud Query Response Size',
      max: limits.totalQueryResponseBytes,
      type: 'queryResponseBytes',
      valueType: 'bytes',
    },
  ] as const;
};

export const Usage: React.FC = () => {
  const { user } = useDefinedContext(AuthContext);
  assert(user);

  const { cloudApi } = useDefinedContext(CloudApiContext);

  const usageQuery = useCloudQuery(() => cloudApi.usage.usage.query());

  return (
    <div>
      {!usageQuery.results && (
        <div className="relative h-[200px]">
          <Loading />
        </div>
      )}
      {usageQuery.results && (
        <div className="flex flex-col gap-2 px-1">
          <div className="mb-1 text-sm font-medium text-textSecondary">
            Usage since{' '}
            {usageQuery.results.billingPeriodStartDate.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          {getUsages(user).map((usage) => {
            assert(usageQuery.results, 'usageQuery.results is not null');
            const usageValue = usageQuery.results.usage[usage.type];
            const usagePercentage = Math.round((usageValue / usage.max) * 100);

            const [used, total] = (() => {
              switch (usage.valueType) {
                case 'number': {
                  const unit = getNumberUnit(usage.max);
                  return [getNumberValue(usageValue, unit), formatNumber(usage.max, unit)];
                }
                case 'duration': {
                  const unit = getDurationUnit(usage.max);
                  return [getDurationValue(usageValue, unit), formatDuration(usage.max, unit)];
                }
                case 'bytes': {
                  const unit = getBytesUnit(usage.max);
                  return [getBytesValue(usageValue, unit), formatBytes(usage.max, unit)];
                }
              }
            })();

            return (
              <div key={usage.type} className="text-textSecodary flex flex-col gap-1 text-xs">
                <div className="font-medium">{usage.label}</div>
                <div className="h-[2px] w-full overflow-hidden rounded-[2px] bg-border">
                  <div className="h-full bg-primary" style={{ width: `${usagePercentage}%` }} />
                </div>
                <div className="flex justify-between text-textTertiary">
                  <div>
                    {used} / {total}
                  </div>
                  <div>{usagePercentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
