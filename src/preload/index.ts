import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Client } from 'pg';
(async () => {
  // Custom APIs for renderer
  const api = {};

  const clientRef: { current: Client | null } = {
    current: null,
  };

  const connectToDatabase = async (database: string) => {
    clientRef.current?.end();
    clientRef.current = new Client({
      database,
      password: 'password',
      user: 'postgres',
    });

    await clientRef.current.connect();
  };

  // Use `contextBridge` APIs to expose Electron APIs to
  // renderer only if context isolation is enabled, otherwise
  // just add to the DOM global.
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld('api', api);
      contextBridge.exposeInMainWorld('connectToDatabase', connectToDatabase);
      contextBridge.exposeInMainWorld('electron', electronAPI);
      contextBridge.exposeInMainWorld('query', (text: string) => clientRef.current!.query(text));
    } catch (error) {
      console.error(error);
    }
  } else {
    // @ts-ignore (define in dts)
    window.connectToDatabase = connectToDatabase;
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
    // @ts-ignore (define in dts)
    window.query = (text: string) => client.query(text);
  }
})();
