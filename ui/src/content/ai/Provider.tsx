import type { PropsWithChildren } from 'react';
import { AiContext } from './Context';
import { useAi } from './useAi';

export const AiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useAi();

  return <AiContext.Provider value={context}>{children}</AiContext.Provider>;
};
