import { electronApp } from '@electron-toolkit/utils';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import type { MenuItemConstructorOptions } from 'electron';
import { Menu, Tray, app, nativeImage } from 'electron';
import settings from 'electron-settings';
import iconPath from '../../resources/trayIconTemplate.png?asset';
import { router } from './router';

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

const createTray = () => {
  const icon = nativeImage.createFromPath(iconPath);

  const tray = new Tray(icon);

  tray.setToolTip('Dabase Link');

  const contextMenuItems: MenuItemConstructorOptions[] = [
    {
      label: 'Quit',
      click: app.quit,
    },
  ];

  if (process.platform !== 'linux') {
    contextMenuItems.unshift(
      {
        label: 'Start on Login',
        type: 'checkbox',
        checked: (settings.getSync('startOnLogin') as boolean | undefined) ?? false,
        click: (menuItem) => {
          const newValue = menuItem.checked;
          settings.setSync('startOnLogin', newValue);
          toggleAutoLaunch(newValue);
        },
      },
      { type: 'separator' },
    );
  }

  const contextMenu = Menu.buildFromTemplate(contextMenuItems);

  tray.setContextMenu(contextMenu);
};

const toggleAutoLaunch = (enable: boolean) => {
  app.setLoginItemSettings({ openAtLogin: enable });
};
