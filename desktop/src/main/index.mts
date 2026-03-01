import { ConnectDb, DisconnectDb, RunQuery, SwitchCatalogOrSchema } from '@/native/types';
import { electronApp } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import log from 'electron-log';
import electronUpdater from 'electron-updater';
import keytar from 'keytar';
import { join } from 'path';
import {
  connectDb,
  disconnectDb,
  getSqliteFile,
  runQuery,
  switchCatalogOrSchema,
} from './connector/connector';
import { buildCredentialUsername, CredentialType } from '@/utils/credentials';
import { parseCredentialUsername } from '@/utils/credentials';
import { dialog } from 'electron';

Object.assign(console, log.functions);

const errorHandler = (reason: unknown): void => {
  if (
    reason instanceof Error &&
    (reason.message === 'Not connected' ||
      reason.message.includes('EADDRNOTAVAIL') ||
      reason.stack?.includes('ssh2') ||
      reason.stack?.includes('node-ssh-forward'))
  ) {
    console.error('SSH tunnel connection lost:', reason);
    return;
  }

  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  log.error(reason);

  void dialog
    .showMessageBox({
      type: 'error',
      title: 'Error',
      message: 'An error occurred. Please consider reporting it.',
      detail: errorMessage,
      buttons: ['OK', 'Report'],
      defaultId: 0,
      cancelId: 0,
    })
    .then((result) => {
      if (result.response === 1) {
        void shell.openExternal(import.meta.env.VITE_DISCORD_INVITE_URL);
      }
    });
};

process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    show: false,
    title: 'SmartQuery',
    titleBarOverlay: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 18, y: 17 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js'),
      webSecurity: true,
    },
  });

  mainWindow.maximize();

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  void mainWindow.loadURL(import.meta.env.VITE_UI_URL);
};

void app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.smartquery');

  if (import.meta.env.PROD) {
    void electronUpdater.autoUpdater.checkForUpdatesAndNotify();
  }

  createWindow();

  ipcMain.handle('handle-request', async (_, method: string, args: unknown[]) => {
    switch (method) {
      case 'addToKeychain': {
        const [username, password, type] = args as [string, string, CredentialType];
        await keytar.setPassword(
          import.meta.env.VITE_KEYCHAIN_SERVICE_NAME,
          buildCredentialUsername({ username, type }),
          password,
        );
        return;
      }
      case 'getFromKeychain': {
        const [username, type] = args as [string, CredentialType];
        return keytar.getPassword(
          import.meta.env.VITE_KEYCHAIN_SERVICE_NAME,
          buildCredentialUsername({ username, type }),
        );
      }
      case 'removeFromKeychain': {
        const [username, type] = args as [string, CredentialType];
        await keytar.deletePassword(
          import.meta.env.VITE_KEYCHAIN_SERVICE_NAME,
          buildCredentialUsername({ username, type }),
        );
        return;
      }
      case 'getUserCredential': {
        const [username] = args as [string?];

        const all = await keytar.findCredentials(import.meta.env.VITE_KEYCHAIN_SERVICE_NAME);
        const userCredential = all.find((credential) => {
          const { rawUsername, type } = parseCredentialUsername(credential.account);
          return type === 'user' && (username ? rawUsername === username : true);
        });

        if (!userCredential) return null;

        return {
          username: userCredential.account,
          password: userCredential.password,
        };
      }
      case 'connectDb': {
        const [connection] = args as [Parameters<ConnectDb>[0]];
        return connectDb(connection);
      }
      case 'switchCatalogOrSchema': {
        return switchCatalogOrSchema(...(args as Parameters<SwitchCatalogOrSchema>));
      }
      case 'disconnectDb': {
        return disconnectDb(...(args as Parameters<DisconnectDb>));
      }
      case 'runQuery': {
        return runQuery(...(args as Parameters<RunQuery>));
      }
      case 'getSqliteFile': {
        return getSqliteFile(mainWindow!);
      }
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  });

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
