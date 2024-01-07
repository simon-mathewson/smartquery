import { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '../../../../link/src/main/router';

export type Connection = inferRouterInputs<AppRouter>['connectDb'];

export type ActiveConnection = Connection & {
  clientId: string;
};
