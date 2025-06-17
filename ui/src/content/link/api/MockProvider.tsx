import React from 'react';
import type { MockProviderProps } from '~/providers/MockProviderProps';
import { type LinkApiClient } from './client';
import { LinkApiContext } from './Context';

export const LinkApiMockProvider: React.FC<MockProviderProps<LinkApiClient | null>> = (props) => {
  const { children, mockOverride } = props;

  return (
    <LinkApiContext.Provider value={{ ...mockOverride } as unknown as LinkApiClient}>
      {children}
    </LinkApiContext.Provider>
  );
};
