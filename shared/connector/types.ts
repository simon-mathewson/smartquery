import type { SSHConnection } from 'node-ssh-forward';
import type { MySqlClient } from './prisma';
import type { RemoteConnection } from '@/connections/types';
import type { Pool as PostgresPool } from 'pg';

export type Connector = {
  connection: RemoteConnection;
  id: string;
  sshTunnel: SSHConnection | null;
} & ({ mysqlClient: MySqlClient } | { postgresPool: PostgresPool });
