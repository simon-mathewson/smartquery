import React from 'react';
import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { LinkApiContextType } from './Context';
import { LinkApiContext } from './Context';

export const LinkApiMockProvider: React.FC<MockProviderProps<LinkApiContextType>> = (props) => {
  const { children, overrides } = props;

  return (
    <LinkApiContext.Provider value={Object.assign({} as LinkApiContextType, overrides)}>
      {children}
    </LinkApiContext.Provider>
  );
};
