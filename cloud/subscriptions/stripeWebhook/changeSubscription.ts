import assert from 'assert';
import type Stripe from 'stripe';
import type { PrismaClient } from '~/prisma/generated';
import { getSubscriptionTypeForProductId } from '../getSubscriptionTypeForProductId';

export const changeSubscription = async (props: {
  prisma: PrismaClient;
  stripeSubscription: Stripe.Subscription;
}) => {
  const { prisma, stripeSubscription } = props;

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

    const newSubscriptionType = getSubscriptionTypeForProductId(productId);

    // Do nothing if subscription is active and type unchanged
    if (
      user.activeSubscription?.type === newSubscriptionType &&
      stripeSubscription.status === 'active'
    ) {
      return;
    }

    // Disable active subscription
    if (user.activeSubscription) {
      assert(
        typeof stripeSubscription.ended_at === 'number',
        'Stripe subscription ended at must be a number',
      );

      await tx.subscription.update({
        where: { id: user.activeSubscription.id },
        data: {
          activeForUser: { disconnect: true },
          endDate: new Date(stripeSubscription.ended_at * 1000),
        },
      });
    }

    // Create new subscription
    if (stripeSubscription.status === 'active') {
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
    }
  });
};
