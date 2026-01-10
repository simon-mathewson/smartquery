import { ConnectDb, DisconnectDb, RunQuery } from '@/native/types';
import { electronApp } from '@electron-toolkit/utils';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import log from 'electron-log';
import unhandled from 'electron-unhandled';
import electronUpdater from 'electron-updater';
import { join } from 'path';
import { connectDb, disconnectDb, getSqliteFile, runQuery } from './connector/connector';

Object.assign(console, log.functions);

unhandled({
  showDialog: true,
  logger: log.error,
  reportButton: () => {
    void shell.openExternal(import.meta.env.VITE_DISCORD_INVITE_URL);
  },
});

// Disable legacy open at login
app.setLoginItemSettings({ openAtLogin: false });

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
      case 'connectDb': {
        return connectDb(...(args as Parameters<ConnectDb>));
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
