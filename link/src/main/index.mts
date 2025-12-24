import 'reflect-metadata';

import log from 'electron-log';
import { electronApp } from '@electron-toolkit/utils';
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { setUpServer } from './utils/setUpServer/setUpServer';
import { initialContext } from './utils/setUpServer/context';
import { cloneDeep } from 'lodash-es';
import electronUpdater from 'electron-updater';
import unhandled from 'electron-unhandled';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';
import { runQuery } from '@/connector/runQuery';
import type { RemoteConnection } from '@/connections/types';
import assert from 'assert';

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

  if (import.meta.env.DEV) {
    const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
    assert(rendererUrl, 'ELECTRON_RENDERER_URL is not set');

    void mainWindow.loadURL(rendererUrl);
  } else {
    const rendererPath = join(__dirname, '../renderer/index.html');
    void mainWindow.loadFile(rendererPath);
  }
};

void app.whenReady().then(() => {
  // Set app user model ID for Windows
  // https://learn.microsoft.com/en-us/windows/win32/shell/appids
  electronApp.setAppUserModelId('dev.smartquery');

  // Set dock icon for macOS
  if (process.platform === 'darwin') {
    app.dock?.setIcon(join(__dirname, '../../resources/apple-icon.png'));
  }

  if (import.meta.env.PROD) {
    void electronUpdater.autoUpdater.checkForUpdatesAndNotify();
  }

  const context = cloneDeep(initialContext);

  setUpServer({
    createContext: () => context,
  });

  createWindow();

  ipcMain.handle('handle-request', async (_, method: string, args: unknown[]) => {
    switch (method) {
      case 'connectDb': {
        const [connection] = args as [RemoteConnection];
        const connector = await connect(connection);

        if (import.meta.env.DEV) {
          console.info('Connected to', connection.id);
        }

        context.connectors[connector.id] = connector;

        return connector.id;
      }
      case 'disconnectDb': {
        const [connectorId] = args as [string];
        if (!(connectorId in context.connectors)) return;

        await disconnect(context.connectors[connectorId]);

        if (import.meta.env.DEV) {
          console.info('Disconnected from', connectorId);
        }

        delete context.connectors[connectorId];
        return;
      }
      case 'runQuery': {
        const [props] = args as [{ connectorId: string; statements: string[] }];
        const { connectorId, statements } = props;

        if (import.meta.env.DEV) {
          console.info(`Processing ${statements.length} queries`);
        }

        if (!(connectorId in context.connectors)) {
          throw new Error('Connector not found');
        }

        const results = await runQuery(context.connectors[connectorId], statements);

        if (import.meta.env.DEV) {
          console.info('Executed queries', results.length);
        }

        return results;
      }
      case 'getSqliteFile': {
        // File picker for SQLite files
        const result = await dialog.showOpenDialog(mainWindow!, {
          title: 'Select SQLite Database File',
          filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }],
          properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          throw new Error('No file selected');
        }

        const fs = await import('fs/promises');
        const filePath = result.filePaths[0];
        const fileBuffer = await fs.readFile(filePath);
        const base64 = fileBuffer.toString('base64');
        const fileName = filePath.split(/[/\\]/).pop() || 'database.db';

        return { name: fileName, base64 };
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
