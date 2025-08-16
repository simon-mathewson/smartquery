import type { RequestHandler } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '~/prisma/generated/client';
import { changeSubscription } from './changeSubscription';
import { revokeSubscription } from './revokeSubscription';
import { grantSubscription } from './grantSubscription';

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2025-07-30.basil' });

export const stripeWebhook: RequestHandler = async (request, response) => {
  const signature = request.headers['stripe-signature'];

  if (!signature) {
    response.status(422).json({ error: 'Stripe signature is required' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = Stripe.webhooks.constructEvent(
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

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (event.type) {
    case 'customer.subscription.deleted':
      await revokeSubscription({ prisma, stripeSubscription: event.data.object });
      break;
    case 'customer.subscription.updated':
      await changeSubscription({ prisma, stripeSubscription: event.data.object });
      break;
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      await grantSubscription({ prisma, invoice: event.data.object, stripe });
      break;
    default:
      break;
  }

  response.status(200).json({ received: true });
};
