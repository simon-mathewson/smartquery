import type { PropsWithChildren } from 'react';
import { CopilotContext } from './Context';
import { useCopilot } from './useCopilot';

export const CopilotProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const context = useCopilot();

  return <CopilotContext.Provider value={context}>{children}</CopilotContext.Provider>;
};
