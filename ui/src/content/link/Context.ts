import { createContext } from 'react';
import type { useLink } from './useLink';

export const LinkContext = createContext<ReturnType<typeof useLink> | null>(null);
