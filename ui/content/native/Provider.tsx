import { useNative } from './useNative';
import { NativeContext } from './Context';
import type { PropsWithChildren } from 'react';

export const NativeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const native = useNative();

  return <NativeContext.Provider value={native}>{children}</NativeContext.Provider>;
};
