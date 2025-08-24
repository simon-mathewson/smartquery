import type Stripe from 'stripe';
import type { PrismaClient, User } from '~/prisma/generated';

export const getOrCreateStripeCustomer = async (props: {
  prisma: PrismaClient;
  stripe: Stripe;
  user: User;
}) => {
  const { prisma, stripe, user } = props;

  if (user.stripeCustomerId) {
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);

    return { stripeCustomerId: customer.id };
  } else {
    const customer = await stripe.customers.create({ email: user.email });

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return { stripeCustomerId: customer.id };
  }
};
