import { electronApp, optimizer } from '@electron-toolkit/utils';
import { app } from 'electron';

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('com.dabase');

  app.on('browser-window-created', (_, window) => {
    // Opens DevTools on F12 in development mode and ignroes Command/Control + R in production.
    optimizer.watchWindowShortcuts(window);
  });

  // createMainWindow();

  // app.on('activate', () => {
  //   // On macOS, re-create window when the dock icon is clicked and there are no other windows open.
  //   if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  // });
});

// Quit when all windows are closed, except on macOS, where the app will stay active until the user
// quits it explicitly.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
