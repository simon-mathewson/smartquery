import { initTRPC } from "@trpc/server";
import { Context } from "./context";

export const trpc = initTRPC.context<Context>().create();
