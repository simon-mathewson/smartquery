import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';
import { appRouter } from './router';
import { createContext } from './context';
import { stripeWebhook } from './subscriptions/stripeWebhook/stripeWebhook';
import AwsXRay from 'aws-xray-sdk';
import http from 'http';
import https from 'https';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Trace outgoing requests via AWS X-Ray
AwsXRay.captureHTTPsGlobal(http);
AwsXRay.captureHTTPsGlobal(https);

const app = express();

app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

// Trace incoming requests via AWS X-Ray
// Applied after health check to avoid tracing it
app.use(AwsXRay.express.openSegment('cloud'));

app.use(
  cors({
    origin: process.env.UI_URL,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: (opts) => {
      const errorMessagesToIgnore = [
        'Not authenticated',
        'Not authenticated as Plus user',
        'No refresh token provided',
        'Invalid refresh token',
        'Invalid email or password',
        'Email already verified',
      ];

      if (!errorMessagesToIgnore.includes(opts.error.message)) {
        console.error(opts.error);
      }
    },
  }),
);

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(AwsXRay.express.closeSegment());

const port = process.env.PORT || 80;

app.listen(port, () => {
  console.log(`Cloud listening on port ${port}`);
});
