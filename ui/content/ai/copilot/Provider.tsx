import type { PropsWithChildren } from 'react';
import { CopilotContext } from './Context';
import { useCopilot } from './useCopilot';

export const CopilotProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const value = useCopilot();

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
};
