import { createContext } from 'react';
import type { useQueue } from './useQueue';

export const ClickOutsideQueueContext = createContext<ReturnType<typeof useQueue> | null>(null);
