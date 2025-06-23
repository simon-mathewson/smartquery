import type { PropsWithChildren } from 'react';
import type { DeepPartial } from 'ts-essentials';
import { AiMockProvider } from '~/content/ai/MockProvider';
import { CloudApiMockProvider } from '~/content/cloud/api/MockProvider';
import { LinkApiMockProvider } from '~/content/link/api/MockProvider';
import { ThemeProvider } from '~/content/theme/Provider';
import { EscapeStackProvider } from '~/shared/hooks/useEscape/useStack/Provider';
import { ToastProvider } from '~/content/toast/Provider';
import { LinkProvider } from '~/content/link/Provider';
import { SqliteProvider } from '~/content/sqlite/Provider';
import { EditProvider } from '~/content/edit/Provider';
import { QueriesProvider } from '~/content/tabs/queries/Provider';
import { TabsProvider } from '~/content/tabs/Provider';
import { DragAndDropProvider } from '~/content/dragAndDrop/Provider';
import { AddToDesktopProvider } from '~/content/settings/addToDesktop/Provider';
import { AuthMockProvider } from '~/content/auth/MockProvider';
import { ConnectionsMockProvider } from '~/content/connections/MockProvider';
import type { ContextTypes } from './ContextTypes';
import { ProviderStack } from './ProviderStack';

const mockProviders = {
  ThemeProvider,
  AiProvider: AiMockProvider,
  EscapeStackProvider,
  ToastProvider,
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
