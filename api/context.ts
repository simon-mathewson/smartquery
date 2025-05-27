import { PrismaClient } from "~/prisma/generated/client";
import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const prisma = new PrismaClient();

  const getUser = () => null;

  return {
    prisma,
    req,
    res,
    user: getUser(),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
