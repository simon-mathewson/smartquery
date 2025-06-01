import { TRPCError } from '@trpc/server';

import { z } from 'zod';
import { trpc } from '../trpc';
import { hashPassword } from './hashPassword';
import crypto from 'crypto';
import { encrypt } from './encrypt';
import { createAuthToken } from './authToken';
import { deriveKeyEncryptionKeyFromPassword } from './deriveKeyEncryptionKeyFromPassword';
import { isAuthenticated } from '~/middlewares/isAuthenticated';

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

      const unauthorizedError = new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });

      if (!user) {
        throw unauthorizedError;
      }

      const hashedPassword = await hashPassword(password, user.passwordSalt);
      if (hashedPassword !== user.password) {
        throw unauthorizedError;
      }

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
      const { keyEncryptionKey } = await deriveKeyEncryptionKeyFromPassword(password);

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
