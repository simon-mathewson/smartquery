import { contextBridge } from 'electron';

try {
  contextBridge.exposeInMainWorld('api', {});
} catch (error) {
  console.error(error);
}
