import {
  PLUS_MAX_AI_CHAT_INPUT_TOKENS,
  PLUS_MAX_AI_CHAT_OUTPUT_TOKENS,
  PLUS_MAX_AI_INLINE_COMPLETION_INPUT_TOKENS,
  PLUS_MAX_AI_INLINE_COMPLETION_OUTPUT_TOKENS,
  PLUS_MAX_QUERY_DURATION_SECONDS,
  PLUS_MAX_QUERY_RESPONSE_BYTES,
} from '@/plus/plus';
import React from 'react';
import { assert } from 'ts-essentials';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { Loading } from '~/shared/components/loading/Loading';
import { useCloudQuery } from '~/shared/hooks/useCloudQuery/useCloudQuery';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { formatNumber } from '~/shared/utils/format/formatNumber';

const usages = [
  {
    divisor: 1e3,
    label: 'Query Duration',
    max: PLUS_MAX_QUERY_DURATION_SECONDS,
    type: 'queryDurationSeconds',
    unit: 'k seconds',
  },
  {
    divisor: 1024 * 1024 * 1024,
    label: 'Query Response Size',
    max: PLUS_MAX_QUERY_RESPONSE_BYTES,
    type: 'queryResponseBytes',
    unit: ' GB',
  },
  {
    divisor: 1e6,
    label: 'AI Chat Input',
    max: PLUS_MAX_AI_CHAT_INPUT_TOKENS,
    type: 'aiChatInputTokens',
    unit: 'm tokens',
  },
  {
    divisor: 1e3,
    label: 'AI Chat Output',
    max: PLUS_MAX_AI_CHAT_OUTPUT_TOKENS,
    type: 'aiChatOutputTokens',
    unit: 'k tokens',
  },
  {
    divisor: 1e6,
    label: 'AI Inline Completion Input',
    max: PLUS_MAX_AI_INLINE_COMPLETION_INPUT_TOKENS,
    type: 'aiInlineCompletionInputTokens',
    unit: 'm tokens',
  },
  {
    divisor: 1e6,
    label: 'AI Inline Completion Output',
    max: PLUS_MAX_AI_INLINE_COMPLETION_OUTPUT_TOKENS,
    type: 'aiInlineCompletionOutputTokens',
    unit: 'm tokens',
  },
] as const;

export const Plus: React.FC = () => {
  const { cloudApi } = useDefinedContext(CloudApiContext);

  const subscriptionQuery = useCloudQuery(() => cloudApi.subscription.subscription.query(), {
    emptyValue: null,
  });

  const getBillingPeriodStart = (startDate: Date) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return new Date(Math.max(startDate.getTime(), startOfMonth.getTime()));
  };

  return (
    <div>
      {!subscriptionQuery.results && (
        <div className="relative h-[200px]">
          <Loading />
        </div>
      )}
      {subscriptionQuery.results && (
        <div className="flex flex-col gap-2 px-1">
          <div className="mb-1 text-sm font-medium text-textSecondary">
            Usage since{' '}
            {getBillingPeriodStart(subscriptionQuery.results.startDate).toLocaleDateString(
              'en-US',
              { day: 'numeric', month: 'long', year: 'numeric' },
            )}
          </div>
          {usages.map((usage) => {
            assert(subscriptionQuery.results, 'subscriptionQuery.results is not null');
            const usageValue = subscriptionQuery.results.usage[usage.type];
            const usagePercentage = Math.round((usageValue / usage.max) * 100);

            return (
              <div key={usage.type} className="text-textSecodary flex flex-col gap-1 text-xs">
                <div className="font-medium">{usage.label}</div>
                <div className="h-[2px] w-full overflow-hidden rounded-[2px] bg-border">
                  <div className="h-full bg-primary" style={{ width: `${usagePercentage}%` }} />
                </div>
                <div className="flex justify-between text-textTertiary">
                  <div>
                    {formatNumber(usageValue / usage.divisor, {
                      maximumFractionDigits: 1,
                    })}{' '}
                    of {formatNumber(usage.max / usage.divisor)}
                    {usage.unit}
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
