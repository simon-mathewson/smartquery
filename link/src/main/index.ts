import { electronApp } from '@electron-toolkit/utils';
import { app, Menu, Tray, nativeImage } from 'electron';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { router } from './router';
import settings from 'electron-settings';
import iconPath from '../../resources/trayIconTemplate.png?asset';

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
    middleware: cors(),
    onError: ({ error }) => console.error(error),
    router,
  });

  server.listen(3500);
  console.log('Link listening on port 3500');
});

const createTray = () => {
  const icon = nativeImage.createFromPath(iconPath);

  const tray = new Tray(icon);

  tray.setToolTip('Dabase Link');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Start on Login',
      type: 'checkbox',
      checked: (settings.getSync('startOnLogin') as boolean | undefined) ?? false,
      click: (menuItem) => {
        const newValue = menuItem.checked;
        settings.setSync('startOnLogin', newValue);
        toggleAutoLaunch(newValue);

        // The context menu closes by default, but we want to keep it open
        tray.popUpContextMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: app.quit,
    },
  ]);
  tray.setContextMenu(contextMenu);
};

const toggleAutoLaunch = (enable: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enable });
};
