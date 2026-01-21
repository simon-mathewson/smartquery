import assert from 'assert';
import type { PrismaClient } from '~/prisma/generated';
import { getSubscriptionTypeForStripeProductId } from './getSubscriptionTypeForStripeProductId';
import type Stripe from 'stripe';

export const grantSubscription = async (props: {
  prisma: PrismaClient;
  invoice: Stripe.Invoice;
  stripe: Stripe;
}) => {
  const { prisma, invoice, stripe } = props;

  const subscriptionId = invoice.lines.data[0].parent?.subscription_item_details?.subscription;
  assert(subscriptionId, 'Subscription ID is required');

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  const customer = stripeSubscription.customer;
  const customerId = typeof customer === 'string' ? customer : customer.id;

  const product = stripeSubscription.items.data[0].price.product;
  const productId = typeof product === 'string' ? product : product.id;

  const price = stripeSubscription.items.data[0].price;
  const priceId = typeof price === 'string' ? price : price.id;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { stripeCustomerId: customerId },
      include: { activeSubscription: true },
    });

    if (user.activeSubscription?.stripeSubscriptionId === stripeSubscription.id) {
      return;
    }

    assert(!user.activeSubscription, 'User already has different active subscription');

    const newSubscriptionType = getSubscriptionTypeForStripeProductId(productId);

    // Create new subscription
    await tx.subscription.create({
      data: {
        activeForUser: { connect: { id: user.id } },
        startDate: new Date(stripeSubscription.start_date * 1000),
        stripePriceId: priceId,
        stripeProductId: productId,
        stripeSubscriptionId: stripeSubscription.id,
        type: newSubscriptionType,
        userId: user.id,
      },
    });
  });
};
