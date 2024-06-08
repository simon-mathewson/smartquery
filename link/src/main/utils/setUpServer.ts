import 'reflect-metadata';

import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { Container } from 'typedi';
import { RouterService } from '../content/RouterService/RouterService';

export const setUpServer = () => {
  const server = createHTTPServer({
    middleware: cors({
      origin: [import.meta.env.VITE_UI_URL],
    }),
    onError: ({ error }) => console.error(error),
    router: Container.get(RouterService).router,
  });

  server.listen(parseInt(import.meta.env.VITE_PORT, 10));

  console.info(`Link listening on port ${import.meta.env.VITE_PORT}`);

  return server.server;
};
