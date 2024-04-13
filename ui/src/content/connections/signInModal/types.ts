import type { Connection } from '~/shared/types';

export type SignInModalInput = {
  connection: Connection;
  onSignIn: (password: string) => Promise<void>;
};
