import { initTRPC } from "@trpc/server";

import { Context } from "./context";
import { authRouter } from "./content/auth/router";

const trpc = initTRPC.context<Context>().create();

export const appRouter = trpc.router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
