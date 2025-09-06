import { subscriptionTypeSchema } from '@/subscriptions/types';
import assert from 'assert';
import { z } from 'zod';
import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '~/trpc';
import { getOrCreateStripeCustomer } from './getOrCreateStripeCustomer';
import { getPriceIdForSubscriptionType } from './getPriceIdForSubscriptionType';
import { prisma } from '~/prisma/client';

export const subscriptionsRouter = trpc.router({
  cancelSubscription: trpc.procedure.use(isAuthenticated).mutation(async (props) => {
    const {
      ctx: { stripe, user },
    } = props;

    assert(user.activeSubscription?.stripeSubscriptionId, 'User has no active subscription');

    await stripe.subscriptions.update(user.activeSubscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }),
  createCheckoutSession: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ subscriptionType: subscriptionTypeSchema }))
    .output(z.object({ clientSecret: z.string() }))
    .mutation(async (props) => {
      const {
        ctx: { stripe, user },
        input: { subscriptionType },
      } = props;

      const { stripeCustomerId } = await getOrCreateStripeCustomer({
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
        return_url: `${process.env.UI_URL}/subscribe/confirm?type=${subscriptionType}`,
        ui_mode: 'custom',
      });

      assert(session.client_secret, 'Client secret is required');

      return { clientSecret: session.client_secret };
    }),
  getCheckoutPrice: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ subscriptionType: subscriptionTypeSchema }))
    .output(
      z.object({
        proration: z.object({ price: z.number(), until: z.date() }).nullable(),
        futurePrice: z.number(),
      }),
    )
    .mutation(async (props) => {
      const {
        ctx: { stripe, user },
        input: { subscriptionType },
      } = props;

      const { stripeCustomerId } = await getOrCreateStripeCustomer({
        prisma,
        stripe,
        user,
      });

      const existingSubscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });
      const existingSubscription = existingSubscriptions.data.at(0) ?? null;

      const newSubscriptionPriceId = getPriceIdForSubscriptionType(subscriptionType);

      if (existingSubscription) {
        assert(
          existingSubscription.items.data.at(0)?.price.id !== newSubscriptionPriceId,
          'User already has this subscription',
        );
      }

      const invoice = await stripe.invoices.createPreview({
        customer: stripeCustomerId,
        subscription: existingSubscription?.id,
        subscription_details: {
          items: [
            {
              id: existingSubscription?.items.data[0].id,
              price: newSubscriptionPriceId,
            },
          ],
          proration_date: existingSubscription ? Math.floor(Date.now() / 1000) : undefined,
        },
      });

      const proration = existingSubscription
        ? {
            price: invoice.lines.data[0].amount + invoice.lines.data[1].amount,
            until: new Date(invoice.lines.data[0].period.end * 1000),
          }
        : null;
      const futurePrice = invoice.lines.data[existingSubscription ? 2 : 0].amount;

      return {
        proration,
        futurePrice,
      };
    }),
  reactivateSubscription: trpc.procedure.use(isAuthenticated).mutation(async (props) => {
    const {
      ctx: { stripe, user },
    } = props;

    assert(user.activeSubscription?.stripeSubscriptionId, 'User has no active subscription');

    await stripe.subscriptions.update(user.activeSubscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  }),
});
