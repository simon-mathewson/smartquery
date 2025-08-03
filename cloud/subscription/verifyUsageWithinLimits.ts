import type { PrismaClient, UsageType } from '~/prisma/generated';
import type { CurrentUser } from '~/context';
import {
  PLUS_MAX_AI_CHAT_INPUT_TOKENS,
  PLUS_MAX_AI_CHAT_OUTPUT_TOKENS,
  PLUS_MAX_AI_INLINE_COMPLETION_INPUT_TOKENS,
  PLUS_MAX_AI_INLINE_COMPLETION_OUTPUT_TOKENS,
  PLUS_MAX_QUERY_DURATION_MILLISECONDS,
  PLUS_MAX_QUERY_RESPONSE_BYTES,
} from '@/plus/plus';
import { getSubscriptionAndUsage } from './getSubscriptionAndUsage';
import { TRPCError } from '@trpc/server';

const usageTypeToLimit: Record<UsageType, number> = {
  aiChatInputTokens: PLUS_MAX_AI_CHAT_INPUT_TOKENS,
  aiChatOutputTokens: PLUS_MAX_AI_CHAT_OUTPUT_TOKENS,
  aiInlineCompletionInputTokens: PLUS_MAX_AI_INLINE_COMPLETION_INPUT_TOKENS,
  aiInlineCompletionOutputTokens: PLUS_MAX_AI_INLINE_COMPLETION_OUTPUT_TOKENS,
  queryDurationMilliseconds: PLUS_MAX_QUERY_DURATION_MILLISECONDS,
  queryResponseBytes: PLUS_MAX_QUERY_RESPONSE_BYTES,
};

export const verifyUsageWithinLimits = async (props: {
  prisma: PrismaClient;
  types: UsageType[];
  user: CurrentUser;
}) => {
  const { prisma, types, user } = props;

  const subscriptionAndUsage = await getSubscriptionAndUsage({ prisma, user });

  types.forEach((type) => {
    const totalUsage = subscriptionAndUsage.usage[type];
    const limit = usageTypeToLimit[type];

    if (totalUsage > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Usage limit exceeded for ${type}`,
      });
    }
  });
};
