import { electronApp } from '@electron-toolkit/utils';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { app } from 'electron';
import { router } from './router';
import { createTray } from './utils/createTray';

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.dabase.link');

  // Hide the dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createTray();

  const server = createHTTPServer({
    middleware: cors({
      origin: [import.meta.env.VITE_UI_URL],
    }),
    onError: ({ error }) => console.error(error),
    router,
  });

  server.listen(parseInt(import.meta.env.VITE_PORT, 10));

  console.log(`Link listening on port ${import.meta.env.VITE_PORT}`);
});
