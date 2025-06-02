import type { RemoteConnection } from '@/types/connection';

export type SignInModalInput = {
  connection: RemoteConnection;
  onSignIn: (credentials: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
  }) => Promise<void>;
};
