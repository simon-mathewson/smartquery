import React from 'react';
import type { MockProviderProps } from '~/providers/MockProviderProps';
import { type LinkApiClient } from './client';
import { LinkApiContext } from './Context';

export const LinkApiMockProvider: React.FC<MockProviderProps<LinkApiClient | null>> = (props) => {
  const { children, overrides } = props;

  return (
    <LinkApiContext.Provider value={{ ...overrides } as unknown as LinkApiClient}>
      {children}
    </LinkApiContext.Provider>
  );
};
