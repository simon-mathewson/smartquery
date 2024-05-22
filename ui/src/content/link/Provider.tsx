import type { PropsWithChildren } from 'react';
import { useLink } from './useLink';
import { LinkContext } from './Context';

export const LinkProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useLink();

  return <LinkContext.Provider value={context}>{children}</LinkContext.Provider>;
};
