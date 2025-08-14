import type { Address } from '@/payments/types';
import type Stripe from 'stripe';
import type { PrismaClient, User } from '~/prisma/generated';

export const createOrUpdateCustomer = async (props: {
  address: Address;
  prisma: PrismaClient;
  stripe: Stripe;
  user: User;
}) => {
  const {
    address: { name, address },
    prisma,
    stripe,
    user,
  } = props;

  const input = {
    name,
    address: {
      city: address.city,
      country: address.country,
      line1: address.line1,
      line2: address.line2 ?? undefined,
      postal_code: address.postal_code,
      state: address.state,
    },
  };

  if (user.stripeCustomerId) {
    await stripe.customers.update(user.stripeCustomerId, input);

    return { stripeCustomerId: user.stripeCustomerId };
  } else {
    const customer = await stripe.customers.create({
      ...input,
      email: user.email,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return { stripeCustomerId: customer.id };
  }
};
