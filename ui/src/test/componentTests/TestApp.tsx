import '../../index.css';

import type { PropsWithChildren } from 'react';
import React from 'react';
import type { SpyFn } from 'tinyspy';
import { spy } from 'tinyspy';
import { Router } from 'wouter';
import { ErrorBoundary } from '~/content/errorBoundary/ErrorBoundary';
import type { ProviderOverrides } from '~/providers/MockProviders';
import { MockProviders } from '~/providers/MockProviders';

export type TestAppOptions = { navigateSpy?: SpyFn; providerOverrides?: ProviderOverrides };

export type TestAppProps = PropsWithChildren<TestAppOptions>;

export const TestApp: React.FC<TestAppProps> = (props) => {
  const { children, providerOverrides } = props;

  const navigateSpy = props.navigateSpy ?? spy();

  return (
    <ErrorBoundary>
      <MockProviders mockOverrides={providerOverrides}>
        <Router hook={() => ['', navigateSpy]}>{children}</Router>
      </MockProviders>
    </ErrorBoundary>
  );
};
