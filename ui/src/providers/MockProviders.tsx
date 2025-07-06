import { AddToDesktopProvider } from '~/content/settings/addToDesktop/Provider';
import { AiMockProvider } from '~/content/ai/MockProvider';
import { AnalyticsMockProvider } from '~/content/analytics/MockProvider';
import { AuthMockProvider } from '~/content/auth/MockProvider';
import { CloudApiMockProvider } from '~/content/cloud/api/MockProvider';
import { ConnectionsMockProvider } from '~/content/connections/MockProvider';
import { DragAndDropProvider } from '~/content/dragAndDrop/Provider';
import { EditProvider } from '~/content/edit/Provider';
import { EscapeStackProvider } from '~/shared/hooks/useEscape/useStack/Provider';
import { LinkApiMockProvider } from '~/content/link/api/MockProvider';
import { LinkProvider } from '~/content/link/Provider';
import { ProviderStack } from './ProviderStack';
import { QueriesProvider } from '~/content/tabs/queries/Provider';
import { SqliteProvider } from '~/content/sqlite/Provider';
import { TabsProvider } from '~/content/tabs/Provider';
import { ThemeProvider } from '~/content/theme/Provider';
import { ToastProvider } from '~/content/toast/Provider';
import type { ContextTypes } from './ContextTypes';
import type { DeepPartial } from 'ts-essentials';
import type { PropsWithChildren } from 'react';
import { ErrorTrackingMockProvider } from '~/content/errors/tracking/MockProvider';
import { UpdateAvailableMockProvider } from '~/content/updateAvailable/MockProvider';

const mockProviders = {
  ErrorTrackingProvider: ErrorTrackingMockProvider,
  AnalyticsProvider: AnalyticsMockProvider,
  ThemeProvider,
  AiProvider: AiMockProvider,
  EscapeStackProvider,
  ToastProvider,
  UpdateAvailableProvider: UpdateAvailableMockProvider,
  CloudApiProvider: CloudApiMockProvider,
  AuthProvider: AuthMockProvider,
  LinkApiProvider: LinkApiMockProvider,
  LinkProvider,
  SqliteProvider,
  ConnectionsProvider: ConnectionsMockProvider,
  EditProvider,
  TabsProvider,
  QueriesProvider,
  DragAndDropProvider,
  AddToDesktopProvider,
} as const;

export type ProviderOverrides = DeepPartial<ContextTypes>;

export type MockProvidersProps = PropsWithChildren<{
  mockOverrides?: ProviderOverrides;
}>;

export const MockProviders: React.FC<MockProvidersProps> = (props) => {
  const { children, mockOverrides } = props;

  return (
    <ProviderStack providers={mockProviders} mockOverrides={mockOverrides}>
      {children}
    </ProviderStack>
  );
};
