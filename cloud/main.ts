import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';
import { appRouter } from './router';
import { createContext } from './context';

const app = express();

console.log(process.env.UI_URL);

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
      console.error(opts.error);
    },
  }),
);

app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

const port = process.env.PORT || 80;

app.listen(port, () => {
  console.log(`Cloud listening on port ${port}`);
});
