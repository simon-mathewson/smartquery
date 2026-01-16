import { assert } from 'ts-essentials';

export const credentialTypes = [
  'user',
  'password',
  'sshPassword',
  'sshPrivateKey',
  'sshPrivateKeyPassphrase',
] as const;

export type CredentialType = (typeof credentialTypes)[number];

export type Credential = {
  username: string;
  password: string;
};

export const buildCredentialUsername = (props: {
  username: string;
  type: CredentialType;
}): string => {
  if (props.type === 'user') {
    return props.username;
  }
  return `${props.username}_${props.type}`;
};

export const parseCredentialUsername = (
  username: string,
): {
  rawUsername: string;
  type: CredentialType | null;
} => {
  const match = username.match(new RegExp(`^(.+?)(?:_(${credentialTypes.join('|')}))?$`));

  const rawUsername = match?.[1];
  assert(rawUsername, 'Unable to find username in $');

  const type = (match?.[2] ?? 'user') as CredentialType;
  assert(credentialTypes.includes(type), 'Invalid credential type');

  return { rawUsername, type };
};
