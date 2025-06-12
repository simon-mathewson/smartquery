import { TRPCError } from '@trpc/server';

import { bytesToHex } from '@noble/ciphers/utils';
import crypto from 'crypto';
import { z } from 'zod';
import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '../trpc';
import { createAuthToken } from './authToken';
import { deriveKeyEncryptionKeyFromPassword } from './deriveKeyEncryptionKeyFromPassword';
import { encrypt } from './encrypt';
import { hashPassword } from './hashPassword';
import { verifyPassword } from './verifyPassword';

export const authRouter = trpc.router({
  currentUser: trpc.procedure
    .use(isAuthenticated)
    .output(z.object({ id: z.string(), email: z.string() }))
    .query(async ({ ctx: { user } }) => user),
  logIn: trpc.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(12),
      }),
    )
    .mutation(async ({ input, ctx: { prisma, setCookie } }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      await verifyPassword(user, password);

      const token = createAuthToken({ userId: user.id });

      setCookie('authToken', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }),
  logOut: trpc.procedure.mutation(async ({ ctx: { setCookie } }) => {
    setCookie('authToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }),
  signUp: trpc.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(12),
      }),
    )
    .mutation(async ({ input, ctx: { prisma } }) => {
      const { email, password } = input;

      const salt = crypto.randomBytes(16).toString('hex');

      const hashedPassword = await hashPassword(password, salt);

      const dataEncryptionKey = crypto.randomBytes(32);
      const keyEncryptionKeySalt = crypto.randomBytes(16);

      const keyEncryptionKey = await deriveKeyEncryptionKeyFromPassword(
        password,
        keyEncryptionKeySalt,
      );

      const { ciphertext: encryptedDataEncryptionKey, nonce: dataEncryptionKeyNonce } = encrypt(
        dataEncryptionKey,
        keyEncryptionKey,
      );

      await prisma.user.create({
        data: {
          dataEncryptionKey: bytesToHex(encryptedDataEncryptionKey),
          dataEncryptionKeyNonce: bytesToHex(dataEncryptionKeyNonce),
          email,
          keyEncryptionKeySalt: bytesToHex(keyEncryptionKeySalt),
          password: hashedPassword,
          passwordSalt: salt,
        },
      });
    }),
});
