import { SSHConnection } from "node-ssh-forward";
import { MySqlClient, PostgresClient } from "./prisma";
import { RemoteConnection } from "@/connections/types";

export type Connector = {
  connection: RemoteConnection;
  id: string;
  prisma: MySqlClient | PostgresClient;
  sshTunnel: SSHConnection | null;
};
