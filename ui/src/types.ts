import { inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '../../link/src/main/router';

export type Query = {
  id: string;
  label?: string;
  sql?: string;
  showEditor?: boolean;
};

export type DropMarker = {
  active?: boolean;
  column: number;
  horizontal: boolean;
  ref: React.MutableRefObject<HTMLDivElement | null>;
  row: number;
};

export type Connection = inferRouterInputs<AppRouter>['connectDb'];
