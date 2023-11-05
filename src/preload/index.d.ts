import { ElectronAPI } from '@electron-toolkit/preload';
import { Client } from 'pg';

declare global {
  interface Window {
    api: unknown;
    connectToDatabase: (database: string) => Promise<void>;
    electron: ElectronAPI;
    query: Client['query'];
  }
}
