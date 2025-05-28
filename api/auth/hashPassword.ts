import crypto from 'crypto';

export const hashPassword = async (password: string, salt: string) => {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(derivedKey.toString('hex'));
    });
  });
};
