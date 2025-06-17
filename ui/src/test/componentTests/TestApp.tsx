import '../../index.css';

import type { PropsWithChildren } from 'react';
import React from 'react';
import { ErrorBoundary } from '~/content/errorBoundary/ErrorBoundary';
import { SettingsOverlay } from '~/content/settings/Overlay';
import { useTheme } from '~/content/theme/useTheme';
import type { MockProvidersProps } from '~/providers/MockProviders';
import { MockProviders } from '~/providers/MockProviders';

export type TestAppProps = PropsWithChildren<{
  mockOverrides?: MockProvidersProps['mockOverrides'];
}>;

export const TestApp: React.FC<TestAppProps> = (props) => {
  const { children, mockOverrides } = props;

  useTheme();

  return (
    <ErrorBoundary>
      <MockProviders mockOverrides={mockOverrides}>
        {children}
        <SettingsOverlay />
      </MockProviders>
    </ErrorBoundary>
  );
};
