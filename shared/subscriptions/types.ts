import { z } from 'zod';

export const subscriptionTypeSchema = z.enum(['plus', 'pro']);

export type SubscriptionType = z.infer<typeof subscriptionTypeSchema>;

export const addressSchema = z.object({
  name: z.string(),
  address: z.object({
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
});

export type Address = z.infer<typeof addressSchema>;
