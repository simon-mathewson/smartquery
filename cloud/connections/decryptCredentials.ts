import { cloneDeep } from 'lodash';
import assert from 'node:assert';
import { decrypt } from '~/auth/decrypt';
import { deriveKeyEncryptionKeyFromPassword } from '~/auth/deriveKeyEncryptionKeyFromPassword';
import { Connection, PrismaClient } from '~/prisma/generated';
import { bytesToUtf8, hexToBytes } from '@noble/ciphers/utils';

export const decryptCredentials = async (props: {
  connection: Connection;
  prisma: PrismaClient;
  userId: string;
  userPassword: string;
}): Promise<Connection> => {
  const { connection, prisma, userId, userPassword } = props;

  assert(connection.encryptCredentials);

  const newConnection = cloneDeep(connection);

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

  assert(newConnection.password);
  assert(newConnection.passwordNonce);

  const decryptedPassword = decrypt(
    hexToBytes(newConnection.password),
    hexToBytes(newConnection.passwordNonce),
    decryptedDek,
  );

  newConnection.password = bytesToUtf8(decryptedPassword);

  if (newConnection.sshPassword) {
    assert(newConnection.sshPasswordNonce);

    const decryptedSshPassword = decrypt(
      hexToBytes(newConnection.sshPassword),
      hexToBytes(newConnection.sshPasswordNonce),
      decryptedDek,
    );

    newConnection.sshPassword = bytesToUtf8(decryptedSshPassword);
  } else if (newConnection.sshPrivateKey) {
    assert(newConnection.sshPrivateKeyNonce);

    const decryptedSshPrivateKey = decrypt(
      hexToBytes(newConnection.sshPrivateKey),
      hexToBytes(newConnection.sshPrivateKeyNonce),
      decryptedDek,
    );

    newConnection.sshPrivateKey = bytesToUtf8(decryptedSshPrivateKey);
  }

  return newConnection;
};
