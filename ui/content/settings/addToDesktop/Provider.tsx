import type { PropsWithChildren } from 'react';
import { useAddToDesktop } from './useAddToDesktop';
import { AddToDesktopContext } from './Context';

export const AddToDesktopProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useAddToDesktop();

  return <AddToDesktopContext.Provider value={context}>{children}</AddToDesktopContext.Provider>;
};
