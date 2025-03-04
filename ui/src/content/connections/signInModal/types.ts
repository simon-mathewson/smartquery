import type { RemoteConnection } from '~/shared/types';

export type SignInModalInput = {
  connection: RemoteConnection;
  onSignIn: (credentials: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
  }) => Promise<void>;
};
