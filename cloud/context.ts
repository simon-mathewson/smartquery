import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as cookie from 'cookie';
import { PrismaClient, User } from '~/prisma/generated/client';
import { verifyAuthToken } from './auth/authToken';

export type Context = {
  getCookie: ReturnType<typeof createGetCookie>;
  setCookie: ReturnType<typeof createSetCookie>;
  prisma: PrismaClient;
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  user: User | null;
};

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> => {
  const prisma = new PrismaClient();

  const getCookie = createGetCookie(req);
  const setCookie = createSetCookie(res);

  const getUser = async () => {
    const authToken = getCookie('authToken');
    if (!authToken) return null;

    const decoded = verifyAuthToken(authToken);

    // Return null if not found, let `isAuthorized` throw to trigger client side logout
    return prisma.user.findUnique({
      where: { id: decoded.userId },
    });
  };

  return {
    getCookie,
    setCookie,
    prisma,
    req,
    res,
    user: await getUser(),
  };
};

export const createGetCookie = (req: CreateExpressContextOptions['req']) => (name: string) => {
  const cookieHeader = req.headers['cookie'];
  if (!cookieHeader) return;
  const cookies = cookie.parse(cookieHeader);
  return cookies[name];
};

export const createSetCookie =
  (res: CreateExpressContextOptions['res']) =>
  (name: string, value: string, options?: cookie.SerializeOptions) => {
    res.setHeader('Set-Cookie', cookie.serialize(name, value, options));
  };
