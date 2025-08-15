import type { RequestHandler } from 'express';
import stripe from 'stripe';
import { PrismaClient } from '~/prisma/generated/client';
import { updateSubscription } from './updateSubscription';

const prisma = new PrismaClient();

export const stripeWebhook: RequestHandler = async (request, response) => {
  const signature = request.headers['stripe-signature'];

  if (!signature) {
    response.status(422).json({ error: 'Stripe signature is required' });
    return;
  }

  let event: stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.log(`⚠️ Webhook signature verification failed.`, error);
    response.sendStatus(400);
    return;
  }

  console.log('Stripe webhook event', event.type);

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await updateSubscription({ prisma, stripeSubscription: event.data.object });
  }

  response.status(200).json({ received: true });
};
