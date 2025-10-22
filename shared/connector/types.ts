import type { SSHConnection } from 'node-ssh-forward';
import type { Pool as MySqlPool } from 'mysql2/promise';
import type { RemoteConnection } from '@/connections/types';
import type { Pool as PostgresPool } from 'pg';

export type Connector = {
  connection: RemoteConnection;
  id: string;
  sshTunnel: SSHConnection | null;
} & ({ mysqlPool: MySqlPool } | { postgresPool: PostgresPool });

export type DbValue = string | string[] | number | bigint | boolean | Date | Buffer | null;
