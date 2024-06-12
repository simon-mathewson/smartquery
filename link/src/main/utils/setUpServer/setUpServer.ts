import 'reflect-metadata';

import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import type { Context } from './context';
import { router } from '../../router/router';

export const setUpServer = (props: { createContext: () => Context }) => {
  const { createContext } = props;

  const server = createHTTPServer({
    createContext,
    middleware: cors({
      origin: [import.meta.env.VITE_UI_URL],
    }),
    onError: ({ error }) => console.error(error),
    router,
  });

  server.listen(parseInt(import.meta.env.VITE_PORT, 10));
  console.info(`Link listening on port ${import.meta.env.VITE_PORT}`);

  return server.server;
};
