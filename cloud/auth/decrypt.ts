import { xchacha20poly1305 } from '@noble/ciphers/chacha';

export const decrypt = (ciphertext: Uint8Array, nonce: Uint8Array, encryptionKey: Uint8Array) => {
  const chacha = xchacha20poly1305(encryptionKey, nonce);
  const plaintext = chacha.decrypt(ciphertext);
  return plaintext;
};
