import 'reflect-metadata';

import { electronApp } from '@electron-toolkit/utils';
import { app } from 'electron';
import { createTray } from './utils/createTray';
import { setUpServer } from './utils/setUpServer/setUpServer';

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.dabase.link');

  // Hide the dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createTray();

  setUpServer();
});
