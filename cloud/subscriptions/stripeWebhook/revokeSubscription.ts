import assert from 'assert';
import type Stripe from 'stripe';
import type { PrismaClient } from '~/prisma/generated';

export const revokeSubscription = async (props: {
  prisma: PrismaClient;
  stripeSubscription: Stripe.Subscription;
}) => {
  const { prisma, stripeSubscription } = props;

  const customer = stripeSubscription.customer;
  const customerId = typeof customer === 'string' ? customer : customer.id;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { stripeCustomerId: customerId },
      include: { activeSubscription: true },
    });

    assert(user.activeSubscription, 'User has no active subscription');
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
  });
};
