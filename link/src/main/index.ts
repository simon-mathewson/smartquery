import 'reflect-metadata';

import log from 'electron-log/main';
import { electronApp } from '@electron-toolkit/utils';
import { app } from 'electron';
import { createTray } from './utils/createTray';
import { setUpServer } from './utils/setUpServer/setUpServer';
import { initialContext } from './utils/setUpServer/context';
import { cloneDeep } from 'lodash';
import { autoUpdater } from 'electron-updater';

Object.assign(console, log.functions);

process.on('uncaughtException', (error) => {
  console.error(error);
});

app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.dabase.link');

  // Hide the dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  if (import.meta.env.PROD) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  createTray();

  const context = cloneDeep(initialContext);

  setUpServer({
    createContext: () => context,
  });
});
