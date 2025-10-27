import type { SSHConnection } from 'node-ssh-forward';
import type { Pool as MySqlPool } from 'mysql2/promise';
import type { RemoteConnection } from '@/connections/types';
import type { Pool as PostgresPool } from 'pg';

export type Connector = {
  connection: RemoteConnection;
  id: string;
  sshTunnel: SSHConnection | null;
} & ({ mysqlPool: MySqlPool } | { postgresPool: PostgresPool });

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

export type LegacyResults = Array<Array<Record<string, DbValue>>>;

export type NewResults = Array<{ fields: Field[]; rows: DbValue[][] }>;

export type Results = NewResults | LegacyResults;
