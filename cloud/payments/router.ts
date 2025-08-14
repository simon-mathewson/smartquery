import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';
import { z } from 'zod';
import { addressSchema } from '@/payments/types';
import { createOrUpdateCustomer } from './createOrUpdateCustomer';
import { subscriptionTypeSchema } from '@/subscriptions/types';
import { getPriceIdForSubscriptionType } from './getPriceIdForSubscriptionType';
import assert from 'assert';

export const paymentsRouter = trpc.router({
  createSession: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ address: addressSchema, subscriptionType: subscriptionTypeSchema }))
    .output(z.object({ clientSecret: z.string() }))
    .mutation(async (props) => {
      const {
        ctx: { prisma, stripe, user },
        input: { address, subscriptionType },
      } = props;

      const { stripeCustomerId } = await createOrUpdateCustomer({
        address,
        prisma,
        stripe,
        user,
      });

      const session = await stripe.checkout.sessions.create({
        ui_mode: 'custom',
        customer: stripeCustomerId,
        line_items: [
          {
            price: getPriceIdForSubscriptionType(subscriptionType),
            quantity: 1,
          },
        ],
        mode: 'subscription',
        return_url: `${process.env.UI_URL}/subscribe?confirm=${subscriptionType}`,
      });

      assert(session.client_secret, 'Client secret is required');

      return { clientSecret: session.client_secret };
    }),
});
