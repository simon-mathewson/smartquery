import { ElectronAPI } from '@electron-toolkit/preload'
import { Client } from 'pg'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    query: Client['query']
  }
}
