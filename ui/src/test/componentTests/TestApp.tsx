import '../../index.css';

import type { PropsWithChildren } from 'react';
import React from 'react';
import { ErrorBoundary } from '~/content/errorBoundary/ErrorBoundary';
import type { MockProvidersProps } from '~/providers/MockProviders';
import { MockProviders } from '~/providers/MockProviders';

export type TestAppProps = PropsWithChildren<{
  providerOverrides?: MockProvidersProps['mockOverrides'];
}>;

export const TestApp: React.FC<TestAppProps> = (props) => {
  const { children, providerOverrides } = props;

  return (
    <ErrorBoundary>
      <MockProviders mockOverrides={providerOverrides}>{children}</MockProviders>
    </ErrorBoundary>
  );
};
