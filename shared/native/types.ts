import type { RemoteConnection } from '@/connections/types';
import type { NewResults } from '@/connector/types';

export type ConnectDb = (connection: RemoteConnection) => Promise<string>;
export type DisconnectDb = (connectorId: string) => Promise<void>;
export type RunQuery = (props: {
  connectorId: string;
  statements: string[];
}) => Promise<NewResults>;

export type GetSqliteFile = (connectionId: string) => Promise<{ name: string; base64: string }>;

export type RequestAnalyticsConsent = () => Promise<boolean>;
export type GetAnalyticsConsent = () => Promise<boolean>;

export type NativeWebviewMessage =
  | {
      type: 'console';
      level: 'log' | 'debug' | 'info' | 'warn' | 'error';
      message: string;
    }
  | ({
      type: 'request';
      id: string;
    } & (
      | { method: 'connectDb'; args: [RemoteConnection] }
      | { method: 'disconnectDb'; args: [string] }
      | { method: 'runQuery'; args: [{ connectorId: string; statements: string[] }] }
      | { method: 'getSqliteFile'; args: [string] }
      | { method: 'requestAnalyticsConsent'; args: [] }
      | { method: 'getAnalyticsConsent'; args: [] }
    ))
  | ({
      type: 'response';
      requestId: string;
    } & ({ data: unknown } | { error: string }));
