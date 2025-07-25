import crypto from 'crypto';
import type { PrismaClient } from '~/prisma/generated';

export const createRefreshToken = async (payload: { userId: string }, prisma: PrismaClient) => {
  const token = crypto.randomBytes(32).toString('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const refreshToken = await prisma.refreshToken.create({
    data: {
      token,
      expiresAt,
      userId: payload.userId,
    },
  });

  return {
    token,
    id: refreshToken.id,
  };
};

export const verifyRefreshToken = async (token: string, prisma: PrismaClient) => {
  const refreshToken = await prisma.refreshToken.findUniqueOrThrow({
    where: { token },
    include: { user: true },
  });

  if (refreshToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: refreshToken.id },
    });
    throw new Error('Refresh token expired');
  }

  return { userId: refreshToken.userId };
};
