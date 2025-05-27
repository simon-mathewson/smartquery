import { TRPCError } from '@trpc/server';

import { z } from 'zod';
import { trpc } from '../../trpc';
import { hashPassword } from './hashPassword';
import crypto from 'crypto';
import { deriveKeyEncryptionKeyFromPassword } from './deriveKeyEncryptionKeyFromPassword';
import { encrypt } from './encrypt';

export const authRouter = trpc.router({
  signUp: trpc.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(12),
        repeatPassword: z.string().min(12),
      }),
    )
    .mutation(async ({ input, ctx: { prisma } }) => {
      const { email, password, repeatPassword } = input;

      if (password !== repeatPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Passwords do not match',
        });
      }

      const { hashedPassword, salt } = await hashPassword(password);

      const dataEncryptionKey = crypto.randomBytes(32);
      const { keyEncryptionKey, salt: keyEncryptionKeySalt } =
        await deriveKeyEncryptionKeyFromPassword(password);

      const { ciphertext: encryptedDataEncryptionKey, nonce: dataEncryptionKeyNonce } = encrypt(
        dataEncryptionKey,
        keyEncryptionKey,
      );

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          passwordSalt: salt,
          dataEncryptionKey: Buffer.from(encryptedDataEncryptionKey).toString('base64'),
          dataEncryptionKeyNonce: Buffer.from(dataEncryptionKeyNonce).toString('base64'),
        },
      });
    }),
});
