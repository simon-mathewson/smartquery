import { ElectronAPI } from '@electron-toolkit/preload';
import { Client } from 'pg';

declare global {
  interface Window {
    api: unknown;
    connect: (connection: { database: string; host: string; port: number }) => Promise<void>;
    electron: ElectronAPI;
    query: Client['query'];
  }
}
