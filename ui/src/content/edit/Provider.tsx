import type { PropsWithChildren } from 'react';
import React from 'react';
import { useEdit } from './useEdit';
import { EditContext } from './Context';

export const EditProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useEdit();

  return <EditContext.Provider value={context}>{children}</EditContext.Provider>;
};
