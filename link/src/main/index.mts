import 'reflect-metadata';

import log from 'electron-log';
import { electronApp } from '@electron-toolkit/utils';
import { app, shell } from 'electron';
import { createTray } from './utils/createTray';
import { setUpServer } from './utils/setUpServer/setUpServer';
import { initialContext } from './utils/setUpServer/context';
import { cloneDeep } from 'lodash-es';
import electronUpdater from 'electron-updater';
import unhandled from 'electron-unhandled';

Object.assign(console, log.functions);

unhandled({
  showDialog: true,
  logger: log.error,
  reportButton: () => {
    void shell.openExternal(import.meta.env.VITE_GITHUB_URL);
  },
});

void app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.smartquery.link');

  // Hide the dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  if (import.meta.env.PROD) {
    void electronUpdater.autoUpdater.checkForUpdatesAndNotify();
  }

  createTray();

  const context = cloneDeep(initialContext);

  setUpServer({
    createContext: () => context,
  });
});
