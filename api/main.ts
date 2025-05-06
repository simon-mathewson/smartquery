import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const port = process.env.PORT || 80;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
