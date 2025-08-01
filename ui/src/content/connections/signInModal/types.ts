import type { RemoteConnection } from '@/connections/types';

export type SignInModalInput = {
  connection: RemoteConnection;
  onSignIn: (credentials: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
    sshPrivateKeyPassphrase?: string;
  }) => Promise<void>;
};
