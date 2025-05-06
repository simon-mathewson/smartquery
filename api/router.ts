import { initTRPC, TRPCError } from "@trpc/server";

import { z } from "zod";
import { Context } from "./context";

const trpc = initTRPC.context<Context>().create();

export const appRouter = trpc.router({});

export type AppRouter = typeof appRouter;
