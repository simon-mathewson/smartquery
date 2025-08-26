import { subscriptionTypeSchema } from '@/subscriptions/types';
import { z } from 'zod';

export const currentUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  activeSubscription: z
    .object({
      endDate: z.date().nullable(),
      startDate: z.date(),
      stripeSubscriptionId: z.string().nullable(),
      type: subscriptionTypeSchema,
    })
    .nullable(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;
