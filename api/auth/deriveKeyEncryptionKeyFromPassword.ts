import crypto from 'crypto';

export const deriveKeyEncryptionKeyFromPassword = (password: string) => {
  const salt = crypto.randomBytes(16);

  return new Promise<{
    keyEncryptionKey: Uint8Array;
    salt: Uint8Array;
  }>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100_000, 32, 'sha256', (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve({
        keyEncryptionKey: new Uint8Array(derivedKey),
        salt,
      });
    });
  });
};
