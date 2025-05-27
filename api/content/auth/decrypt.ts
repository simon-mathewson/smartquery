import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { bytesToUtf8 } from '@noble/ciphers/utils';

export const decrypt = (ciphertext: Uint8Array, nonce: Uint8Array, encryptionKey: Uint8Array) => {
  const chacha = xchacha20poly1305(encryptionKey, nonce);
  const plaintext = chacha.decrypt(ciphertext);
  return bytesToUtf8(plaintext);
};
