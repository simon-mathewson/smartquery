import { createContext } from 'react';
import type { trpcClient } from './client';

export const TrpcContext = createContext<typeof trpcClient | null>(null);
