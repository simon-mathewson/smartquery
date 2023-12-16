import { electronApp } from '@electron-toolkit/utils';
import { app } from 'electron';
import { initTRPC } from '@trpc/server';
import { Client } from 'pg';
import { z } from 'zod';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

const clientRef: { current: Client | null } = {
  current: null,
};

const t = initTRPC.create();

const appRouter = t.router({
  connectDb: t.procedure
    .input(
      z.object({
        database: z.string(),
        host: z.string(),
        name: z.string(),
        password: z.string(),
        port: z.number().int(),
        user: z.string(),
      }),
    )
    .mutation(async (props) => {
      const { database, host, password, port, user } = props.input;

      await clientRef.current?.end();

      clientRef.current = new Client({
        database,
        host,
        password,
        port,
        user,
      });

      await clientRef.current.connect();
    }),
  sendQuery: t.procedure
    .input(z.string())
    .query(async (props) => clientRef.current!.query(props.input)),
});

export type AppRouter = typeof appRouter;

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('com.dabase');

  const server = createHTTPServer({
    middleware: cors(),
    router: appRouter,
  });

  server.listen(3000);
  console.log('Link listening on port 3000');

  // app.on('browser-window-created', (_, window) => {
  //   // Opens DevTools on F12 in development mode and ignroes Command/Control + R in production.
  //   optimizer.watchWindowShortcuts(window);
  // });

  // createMainWindow();

  // app.on('activate', () => {
  //   // On macOS, re-create window when the dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  // });
});

// Quit when all windows are closed, except on macOS, where the app will stay active until the user
// quits it explicitly.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });
