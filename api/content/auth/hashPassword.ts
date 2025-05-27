import crypto from 'crypto';

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise<{ hashedPassword: string; salt: string }>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve({
        hashedPassword: derivedKey.toString('hex'),
        salt: salt,
      });
    });
  });
};
