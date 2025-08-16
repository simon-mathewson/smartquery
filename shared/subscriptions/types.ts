import { z } from 'zod';

export const subscriptionTypeSchema = z.enum(['plus', 'pro']);

export type SubscriptionType = z.infer<typeof subscriptionTypeSchema>;
