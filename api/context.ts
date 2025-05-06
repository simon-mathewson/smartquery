import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => null;

  return {
    req,
    res,
    user: getUser(),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
