import { cloneDeep } from 'lodash';
import assert from 'node:assert';
import { decrypt } from '~/auth/decrypt';
import { deriveKeyEncryptionKeyFromPassword } from '~/auth/deriveKeyEncryptionKeyFromPassword';
import { encrypt } from '~/auth/encrypt';
import type { Connection, Prisma, PrismaClient } from '~/prisma/generated';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils';

export const encryptCredentials = async (props: {
  connection: Prisma.ConnectionCreateWithoutUserInput;
  existingConnection?: Connection;
  prisma: PrismaClient;
  userId: string;
  userPassword: string;
}): Promise<Prisma.ConnectionCreateWithoutUserInput> => {
  const { connection, existingConnection, prisma, userId, userPassword } = props;

  if (!connection.encryptCredentials) {
    return connection;
  }

  const newConnection = cloneDeep(connection);

  assert(newConnection.password);

  const { dataEncryptionKey, dataEncryptionKeyNonce, keyEncryptionKeySalt } =
    await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { dataEncryptionKey: true, dataEncryptionKeyNonce: true, keyEncryptionKeySalt: true },
    });

  const keyEncryptionKey = await deriveKeyEncryptionKeyFromPassword(
    userPassword,
    hexToBytes(keyEncryptionKeySalt),
  );
  const decryptedDek = decrypt(
    hexToBytes(dataEncryptionKey),
    hexToBytes(dataEncryptionKeyNonce),
    keyEncryptionKey,
  );

  const isNewPassword =
    !existingConnection?.encryptCredentials ||
    existingConnection.password !== newConnection.password;

  if (isNewPassword) {
    const passwordEncryption = encrypt(newConnection.password, decryptedDek);

    newConnection.password = bytesToHex(passwordEncryption.ciphertext);
    newConnection.passwordNonce = bytesToHex(passwordEncryption.nonce);
  }

  const isNewSshPassword =
    !existingConnection?.encryptCredentials ||
    existingConnection.sshPassword !== newConnection.sshPassword;
  const isNewSshPrivateKey =
    !existingConnection?.encryptCredentials ||
    existingConnection.sshPrivateKey !== newConnection.sshPrivateKey;
  const isNewSshPrivateKeyPassphrase =
    !existingConnection?.encryptCredentials ||
    !existingConnection.isSshPrivateKeyPassphraseEncrypted ||
    existingConnection.sshPrivateKeyPassphrase !== newConnection.sshPrivateKeyPassphrase;

  if (newConnection.sshPassword && isNewSshPassword) {
    const sshPasswordEncryption = encrypt(newConnection.sshPassword, decryptedDek);

    newConnection.sshPassword = bytesToHex(sshPasswordEncryption.ciphertext);
    newConnection.sshPasswordNonce = bytesToHex(sshPasswordEncryption.nonce);
  } else if (newConnection.sshPrivateKey && isNewSshPrivateKey) {
    const sshPrivateKeyEncryption = encrypt(newConnection.sshPrivateKey, decryptedDek);

    newConnection.sshPrivateKey = bytesToHex(sshPrivateKeyEncryption.ciphertext);
    newConnection.sshPrivateKeyNonce = bytesToHex(sshPrivateKeyEncryption.nonce);
  }

  if (newConnection.sshPrivateKeyPassphrase && isNewSshPrivateKeyPassphrase) {
    const sshPrivateKeyPassphraseEncryption = encrypt(
      newConnection.sshPrivateKeyPassphrase,
      decryptedDek,
    );
    newConnection.sshPrivateKeyPassphrase = bytesToHex(
      sshPrivateKeyPassphraseEncryption.ciphertext,
    );
    newConnection.sshPrivateKeyPassphraseNonce = bytesToHex(
      sshPrivateKeyPassphraseEncryption.nonce,
    );
    newConnection.isSshPrivateKeyPassphraseEncrypted = true;
  }

  return newConnection;
};
