import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  handleRequest: (method: string, args: unknown[]) =>
    ipcRenderer.invoke('handle-request', method, args),
});
