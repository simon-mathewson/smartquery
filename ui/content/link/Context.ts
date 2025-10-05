import { createContext } from 'react';
import type { useLink } from './useLink';

export type LinkContextType = ReturnType<typeof useLink>;

export const LinkContext = createContext<LinkContextType | null>(null);

LinkContext.displayName = 'LinkContext';
