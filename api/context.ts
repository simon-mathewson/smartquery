import { PrismaClient } from '~/prisma/generated/client';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import cookie, { SerializeOptions as CookieSerializeOptions } from 'cookie';
import { verifyAuthToken } from './auth/authToken';

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const prisma = new PrismaClient();

  const getCookie = createGetCookie(req);
  const setCookie = createSetCookie(res);

  const getUser = async () => {
    const authToken = getCookie('authToken');
    if (!authToken) return null;

    const decoded = verifyAuthToken(authToken);

    return prisma.user.findUniqueOrThrow({
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

export type Context = Awaited<ReturnType<typeof createContext>>;

export const createGetCookie = (req: CreateExpressContextOptions['req']) => (name: string) => {
  const cookieHeader = req.headers['cookie'];
  if (!cookieHeader) return;
  const cookies = cookie.parse(cookieHeader);
  return cookies[name];
};

export const createSetCookie =
  (res: CreateExpressContextOptions['res']) =>
  (name: string, value: string, options?: CookieSerializeOptions) => {
    res.setHeader('Set-Cookie', cookie.serialize(name, value, options));
  };
