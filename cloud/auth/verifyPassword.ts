import { TRPCError } from '@trpc/server';
import type { User } from '~/prisma/generated';
import { hashPassword } from './hashPassword';

export const verifyPassword = async (user: User, password: string) => {
  const hashedPassword = await hashPassword(password, user.passwordSalt);

  if (hashedPassword !== user.password) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });
  }
};
