import { bytesToHex } from '@noble/ciphers/utils';
import crypto from 'node:crypto';
import { deriveKeyEncryptionKeyFromPassword } from './deriveKeyEncryptionKeyFromPassword';
import { encrypt } from './encrypt';
import { hashPassword } from './hashPassword';

export const setUpUserPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');

  const hashedPassword = await hashPassword(password, salt);

  const dataEncryptionKey = crypto.randomBytes(32);
  const keyEncryptionKeySalt = crypto.randomBytes(16);

  const keyEncryptionKey = await deriveKeyEncryptionKeyFromPassword(password, keyEncryptionKeySalt);

  const { ciphertext: encryptedDataEncryptionKey, nonce: dataEncryptionKeyNonce } = encrypt(
    dataEncryptionKey,
    keyEncryptionKey,
  );

  return {
    dataEncryptionKey: bytesToHex(encryptedDataEncryptionKey),
    dataEncryptionKeyNonce: bytesToHex(dataEncryptionKeyNonce),
    keyEncryptionKeySalt: bytesToHex(keyEncryptionKeySalt),
    password: hashedPassword,
    passwordSalt: salt,
  };
};
