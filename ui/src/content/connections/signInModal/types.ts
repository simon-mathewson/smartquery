import type { Connection } from '~/shared/types';

export type SignInModalInput = {
  connection: Connection;
  onSignIn: (credentials: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
  }) => Promise<void>;
};
