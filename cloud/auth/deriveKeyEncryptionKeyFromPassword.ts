import crypto from 'crypto';

export const deriveKeyEncryptionKeyFromPassword = (password: string, salt: Uint8Array) => {
  return new Promise<Buffer<ArrayBufferLike>>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100_000, 32, 'sha256', (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(derivedKey);
    });
  });
};
