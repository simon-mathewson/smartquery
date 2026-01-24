import type { RemoteConnection } from '@/connections/types';
import type { SubscriptionType } from '@/subscriptions/types';
import type { Credential, CredentialType } from '@/utils/credentials';

export type DbValue = string | null;

export type Field = {
  name: string;
} & (
  | {
      type: 'column';
      ref:
        | { column: string; schema?: string; table: string }
        | { columnId: number; tableId: number };
    }
  | { type: 'virtual' | 'column-or-virtual' }
);

export type Results = Array<{ fields: Field[]; rows: DbValue[][] }>;

export type ConnectDb = (connection: RemoteConnection) => Promise<string>;
export type SwitchCatalogOrSchema = (
  connectorId: string,
  catalog?: string,
  schema?: string,
) => Promise<void>;
export type DisconnectDb = (connectorId: string) => Promise<void>;
export type RunQuery = (props: { connectorId: string; statements: string[] }) => Promise<Results>;

export type GetSqliteFile = (connectionId: string) => Promise<{ name: string; base64: string }>;

export type AddToKeychain = (
  username: string,
  password: string,
  type: CredentialType,
) => Promise<void>;
export type GetFromKeychain = (username: string, type: CredentialType) => Promise<string | null>;
export type RemoveFromKeychain = (username: string, type: CredentialType) => Promise<void>;
export type GetUserCredential = (username?: string) => Promise<Credential | null>;

export type WriteToClipboard = (text: string) => void;

export type ShareFile = (content: string, filename: string, mimeType: string) => Promise<void>;

export type GetSubscriptionPrice = (type: SubscriptionType) => Promise<string>;
export type PurchaseSubscription = (type: SubscriptionType, userId: string) => Promise<void>;
export type FinishPurchase = () => Promise<void>;

export type NativeBridgeMessage =
  | { type: 'electron-ready' }
  | {
      type: 'console';
      level: 'log' | 'debug' | 'info' | 'warn' | 'error';
      messages?: string[];
    }
  | ({
      type: 'request';
      id: string;
    } & (
      | { method: 'addToKeychain'; args: Parameters<AddToKeychain> }
      | { method: 'connectDb'; args: Parameters<ConnectDb> }
      | { method: 'disconnectDb'; args: Parameters<DisconnectDb> }
      | { method: 'finishPurchase'; args: Parameters<FinishPurchase> }
      | { method: 'getFromKeychain'; args: Parameters<GetFromKeychain> }
      | { method: 'getSqliteFile'; args: Parameters<GetSqliteFile> }
      | { method: 'getSubscriptionPrice'; args: Parameters<GetSubscriptionPrice> }
      | { method: 'getUserCredential'; args: Parameters<GetUserCredential> }
      | { method: 'purchaseSubscription'; args: Parameters<PurchaseSubscription> }
      | { method: 'removeFromKeychain'; args: Parameters<RemoveFromKeychain> }
      | { method: 'runQuery'; args: Parameters<RunQuery> }
      | { method: 'shareFile'; args: Parameters<ShareFile> }
      | { method: 'switchCatalogOrSchema'; args: Parameters<SwitchCatalogOrSchema> }
      | { method: 'writeToClipboard'; args: Parameters<WriteToClipboard> }
    ))
  | ({
      type: 'response';
      requestId: string;
    } & ({ data: unknown } | { error: string }));
