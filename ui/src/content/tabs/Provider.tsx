import type { PropsWithChildren } from 'react';
import { useTabs } from './useTabs';
import { TabsContext } from './Context';

export const TabsProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useTabs();

  return <TabsContext.Provider value={context}>{children}</TabsContext.Provider>;
};
