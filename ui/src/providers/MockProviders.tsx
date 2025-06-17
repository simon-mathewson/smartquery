import type { PropsWithChildren } from 'react';
import { assert } from 'ts-essentials';
import { AiMockProvider } from '~/content/ai/MockProvider';
import { CloudApiMockProvider } from '~/content/cloud/api/MockProvider';
import { LinkApiMockProvider } from '~/content/link/api/MockProvider';
import { useBuildProviders } from './useBuildProviders';
import { ThemeProvider } from '~/content/theme/Provider';
import { EscapeStackProvider } from '~/shared/hooks/useEscape/useStack/Provider';
import { ToastProvider } from '~/content/toast/Provider';
import { AuthProvider } from '~/content/auth/Provider';
import { LinkProvider } from '~/content/link/Provider';
import { SqliteProvider } from '~/content/sqlite/Provider';
import { ConnectionsProvider } from '~/content/connections/Provider';
import { EditProvider } from '~/content/edit/Provider';
import { QueriesProvider } from '~/content/tabs/queries/Provider';
import { TabsProvider } from '~/content/tabs/Provider';
import { DragAndDropProvider } from '~/content/dragAndDrop/Provider';
import { AddToDesktopProvider } from '~/content/settings/addToDesktop/Provider';

const mockProviders = {
  ThemeProvider,
  AiMockProvider,
  EscapeStackProvider,
  ToastProvider,
  CloudApiMockProvider,
  AuthProvider,
  LinkApiMockProvider,
  LinkProvider,
  SqliteProvider,
  ConnectionsProvider,
  EditProvider,
  TabsProvider,
  QueriesProvider,
  DragAndDropProvider,
  AddToDesktopProvider,
} as const;

export type MockProvidersProps = PropsWithChildren<{
  mockOverrides?: Partial<Record<keyof typeof mockProviders, unknown>>;
}>;

export const MockProviders: React.FC<MockProvidersProps> = (props) => {
  const { children, mockOverrides } = props;

  const AllProviders = useBuildProviders(mockProviders, children, mockOverrides);

  assert(AllProviders !== null);

  return <AllProviders />;
};
