import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as cookie from 'cookie';
import type { User } from '~/prisma/generated/client';
import { PrismaClient } from '~/prisma/generated/client';
import { verifyAccessToken } from './auth/accessToken';

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
    const accessToken = getCookie('accessToken');
    if (!accessToken) return null;

    const decoded = verifyAccessToken(accessToken);

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
    const existingCookies = res.getHeader('Set-Cookie') as string[] | undefined;
    res.setHeader('Set-Cookie', [
      ...(existingCookies ?? []),
      cookie.serialize(name, value, options),
    ]);
  };
