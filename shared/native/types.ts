import type { RemoteConnection } from '@/connections/types';
import type { NewResults } from '@/connector/types';

export type ConnectDb = (connection: RemoteConnection) => Promise<string>;
export type DisconnectDb = (connectorId: string) => Promise<void>;
export type RunQuery = (props: {
  connectorId: string;
  statements: string[];
}) => Promise<NewResults>;

export type GetSqliteFile = (connectionId: string) => Promise<{ name: string; base64: string }>;

export type AddToKeychain = (username: string, password: string) => Promise<void>;

export type WriteToClipboard = (text: string) => void;

export type NativeWebviewMessage =
  | {
      type: 'console';
      level: 'log' | 'debug' | 'info' | 'warn' | 'error';
      messages?: string[];
    }
  | ({
      type: 'request';
      id: string;
    } & (
      | { method: 'addToKeychain'; args: [string, string] }
      | { method: 'connectDb'; args: [RemoteConnection] }
      | { method: 'disconnectDb'; args: [string] }
      | { method: 'runQuery'; args: [{ connectorId: string; statements: string[] }] }
      | { method: 'getSqliteFile'; args: [string] }
      | { method: 'writeToClipboard'; args: [string] }
    ))
  | ({
      type: 'response';
      requestId: string;
    } & ({ data: unknown } | { error: string }));
