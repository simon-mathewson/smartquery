import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import crypto from 'crypto';
import { utf8ToBytes } from '@noble/ciphers/utils';

export const encrypt = (plaintext: string | Uint8Array, encryptionKey: Uint8Array) => {
  const nonce = crypto.randomBytes(24);
  const chacha = xchacha20poly1305(encryptionKey, nonce);

  const plaintextBytes = typeof plaintext === 'string' ? utf8ToBytes(plaintext) : plaintext;

  const ciphertext = chacha.encrypt(plaintextBytes);

  return { ciphertext, nonce };
};
