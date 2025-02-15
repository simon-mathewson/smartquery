import type { MenuItemConstructorOptions } from 'electron';
import { Menu, Tray, app, nativeImage } from 'electron';
import Store from 'electron-store';
import iconPath from '../../../resources/trayIconTemplate.png?asset';

const store = new Store<{ startOnLogin: boolean }>({
  defaults: { startOnLogin: false },
});

/**
 * Create icon in OS tray and set up context menu
 */
export const createTray = () => {
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
        checked: store.get('startOnLogin') === true,
        click: (menuItem) => {
          const newValue = menuItem.checked;
          store.set('startOnLogin', newValue);
          app.setLoginItemSettings({ openAtLogin: newValue });
        },
      },
      { type: 'separator' },
    );
  }

  const contextMenu = Menu.buildFromTemplate(contextMenuItems);

  tray.setContextMenu(contextMenu);
};
