import { subscriptionTypeSchema } from '@/subscriptions/types';
import assert from 'assert';
import { z } from 'zod';
import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';
import { getOrCreateCustomer } from './getOrCreateCustomer';
import { getPriceIdForSubscriptionType } from './getPriceIdForSubscriptionType';

export const subscriptionsRouter = trpc.router({
  cancelSubscription: trpc.procedure.use(isAuthenticated).mutation(async (props) => {
    const {
      ctx: { stripe, user },
    } = props;

    assert(user.activeSubscription?.stripeSubscriptionId, 'User has no active subscription');

    await stripe.subscriptions.cancel(user.activeSubscription.stripeSubscriptionId);
  }),
  createCheckoutSession: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ subscriptionType: subscriptionTypeSchema }))
    .output(z.object({ clientSecret: z.string() }))
    .mutation(async (props) => {
      const {
        ctx: { prisma, stripe, user },
        input: { subscriptionType },
      } = props;

      const { stripeCustomerId } = await getOrCreateCustomer({
        prisma,
        stripe,
        user,
      });

      const session = await stripe.checkout.sessions.create({
        automatic_tax: { enabled: true },
        billing_address_collection: 'required',
        customer_update: { address: 'auto' },
        customer: stripeCustomerId,
        line_items: [{ price: getPriceIdForSubscriptionType(subscriptionType), quantity: 1 }],
        mode: 'subscription',
        return_url: `${process.env.UI_URL}/subscribe?confirm=${subscriptionType}`,
        ui_mode: 'custom',
      });

      assert(session.client_secret, 'Client secret is required');

      return { clientSecret: session.client_secret };
    }),
});
