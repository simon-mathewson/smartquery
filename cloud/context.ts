import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import * as cookie from 'cookie';
import type { Subscription, User } from '~/prisma/generated/client';
import { verifyAccessToken } from './auth/accessToken';
import type { Connector } from '@/connector/types';
import { GoogleGenAI } from '@google/genai';
import Stripe from 'stripe';
import { prisma } from '~/prisma/client';
import { castArray } from 'lodash';

export type CurrentUser = User & { activeSubscription: Subscription | null };

export type Context = {
  connectors: Record<string, Connector>;
  getCookie: ReturnType<typeof createGetCookie>;
  googleAi: GoogleGenAI;
  ip: string | undefined;
  req: CreateExpressContextOptions['req'];
  res: CreateExpressContextOptions['res'];
  setCookie: ReturnType<typeof createSetCookie>;
  stripe: Stripe;
  user: CurrentUser | null;
};

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> => {
  const googleAi = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

  const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2025-07-30.basil' });

  const getCookie = createGetCookie(req);
  const setCookie = createSetCookie(res);

  const getUser = async () => {
    const accessToken = getCookie('accessToken');
    if (!accessToken) return null;

    const decoded = verifyAccessToken(accessToken);

    // Return null if not found, let `isAuthorized` throw to trigger client side logout
    return prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { activeSubscription: true },
    });
  };

  const ip = castArray(req.headers['x-forwarded-for']).at(0) ?? req.socket.remoteAddress;

  return {
    connectors: {},
    googleAi,
    ip,
    getCookie,
    setCookie,
    req,
    res,
    stripe,
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
