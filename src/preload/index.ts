import { contextBridge } from 'electron';
import { connectDb } from './connectDb';

try {
  contextBridge.exposeInMainWorld('api', {
    connectDb,
  });
} catch (error) {
  console.error(error);
}
