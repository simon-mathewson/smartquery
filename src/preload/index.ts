import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Client } from 'pg';
(async () => {
  // Custom APIs for renderer
  const api = {};

  const client = new Client({
    database: 'mathewson_metals_development',
    password: 'password',
    user: 'postgres',
  });

  await client.connect();

  // Use `contextBridge` APIs to expose Electron APIs to
  // renderer only if context isolation is enabled, otherwise
  // just add to the DOM global.
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('electron', electronAPI);
      contextBridge.exposeInMainWorld('api', api);
      contextBridge.exposeInMainWorld('query', (text: string) => client.query(text));
    } catch (error) {
      console.error(error);
    }
  } else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
    // @ts-ignore (define in dts)
    window.query = (text: string) => client.query(text);
  }
})();
