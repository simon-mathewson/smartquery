import type { inferRouterOutputs } from '@trpc/server';
import type { appRouter } from '../../../../cloud/router';

export type User = inferRouterOutputs<typeof appRouter>['auth']['currentUser'];
