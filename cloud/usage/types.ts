import { z } from 'zod';

export const usageSchema = z.object({
  billingPeriodStartDate: z.date(),
  usage: z.object({
    aiCredits: z.number().int().nonnegative(),
    queryDurationMilliseconds: z.number().int().nonnegative(),
    queryResponseBytes: z.number().int().nonnegative(),
  }),
});
