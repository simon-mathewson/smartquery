import { TRPCError } from '@trpc/server';

import crypto from 'crypto';
import { z } from 'zod';
import { sendEmail } from '~/email/sendEmail';
import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '../trpc';
import { createAccessToken } from './accessToken';
import { createRefreshToken, verifyRefreshToken } from './refreshToken';
import { setUpUserPassword } from './setUpUserPassword';
import { verifyPassword } from './verifyPassword';
import { currentUserSchema } from '@/user/types';

export const authRouter = trpc.router({
  currentUser: trpc.procedure
    .use(isAuthenticated)
    .output(currentUserSchema)
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

      const accessToken = createAccessToken(user.id);
      const { token: refreshToken, id: refreshTokenId } = await createRefreshToken(
        { userId: user.id },
        prisma,
      );

      setCookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 15 * 60, // 15 minutes
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/trpc/auth.refresh', // Crucial: Only sent to refresh endpoint
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      setCookie('refreshTokenId', refreshTokenId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }),
  logOut: trpc.procedure.mutation(async ({ ctx: { setCookie, getCookie, prisma } }) => {
    const refreshTokenId = getCookie('refreshTokenId');

    if (refreshTokenId) {
      await prisma.refreshToken.deleteMany({
        where: { id: refreshTokenId },
      });
    }

    setCookie('accessToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    setCookie('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/trpc/auth.refresh',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    setCookie('refreshTokenId', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }),
  refresh: trpc.procedure.mutation(async ({ ctx: { prisma, getCookie, setCookie } }) => {
    const refreshToken = getCookie('refreshToken');

    if (!refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No refresh token provided',
      });
    }

    try {
      const { userId } = await verifyRefreshToken(refreshToken, prisma);

      const newAccessToken = createAccessToken(userId);

      setCookie('accessToken', newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60, // 15 minutes
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    } catch {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
    }
  }),
  requestResetPassword: trpc.procedure
    .input(z.string().email())
    .mutation(async ({ input, ctx: { prisma } }) => {
      const email = input;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const resetPasswordToken = crypto.randomBytes(32).toString('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken },
      });

      const verificationLink = `${process.env.UI_URL}/reset-password?token=${resetPasswordToken}`;

      void sendEmail(
        email,
        'Reset your password – SmartQuery',
        `Someone requested a password reset for your SmartQuery account. If this was you, please click the following link:\n${verificationLink}\n\nIf this was not you, please ignore this email.\n\nNote that after changing your password, your encrypted connection credentials will no longer be usable and have to be re-entered.`,
      );
    }),
  resetPassword: trpc.procedure
    .input(z.object({ token: z.string(), password: z.string().min(12) }))
    .mutation(async ({ input, ctx: { prisma } }) => {
      const { token, password } = input;

      const user = await prisma.user.findUnique({
        where: { resetPasswordToken: token },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: await setUpUserPassword(password),
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

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      await prisma.user.create({
        data: {
          ...(await setUpUserPassword(password)),
          email,
          emailVerificationToken,
        },
      });

      const verificationLink = `${process.env.UI_URL}/verify-email?token=${emailVerificationToken}`;

      void sendEmail(
        email,
        'Please verify your email',
        `Welcome to SmartQuery!\n\nPlease verify your email by clicking the following link:\n${verificationLink}`,
      );
    }),
  verifyEmail: trpc.procedure
    .input(z.string())
    .mutation(async ({ input: token, ctx: { prisma } }) => {
      const user = await prisma.user.findUnique({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email already verified',
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }),
});
