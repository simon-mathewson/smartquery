import { electronApp } from '@electron-toolkit/utils';
import { app } from 'electron';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { router } from './router';

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('com.dabase');

  const server = createHTTPServer({
    middleware: cors(),
    onError: ({ error }) => console.error(error),
    router,
  });

  server.listen(3000);
  console.log('Link listening on port 3000');
});
