import { AddToDesktopProvider } from '~/content/settings/addToDesktop/Provider';
import { AnalyticsProvider } from '~/content/analytics/Provider';
import { AuthProvider } from '~/content/auth/Provider';
import { CloudApiProvider } from '~/content/cloud/api/Provider';
import { ConnectionsProvider } from '~/content/connections/Provider';
import { DragAndDropProvider } from '~/content/dragAndDrop/Provider';
import { EditProvider } from '~/content/edit/Provider';
import { EscapeStackProvider } from '../shared/hooks/useEscape/useStack/Provider';
import { LinkApiProvider } from '~/content/link/api/Provider';
import { LinkProvider } from '~/content/link/Provider';
import { ProviderStack } from './ProviderStack';
import { QueriesProvider } from '~/content/tabs/queries/Provider';
import { SqliteProvider } from '~/content/sqlite/Provider';
import { TabsProvider } from '~/content/tabs/Provider';
import { ThemeProvider } from '~/content/theme/Provider';
import { ToastProvider } from '../content/toast/Provider';
import React from 'react';
import type { ContextTypes } from './ContextTypes';
import type { PropsWithChildren } from 'react';
import { ErrorTrackingProvider } from '~/content/errors/tracking/Provider';
import { UpdateAvailableProvider } from '~/content/updateAvailable/Provider';
import { ActiveConnectionProvider } from '~/content/connections/activeConnection/Provider';

const providers = {
  ThemeProvider,
  ErrorTrackingProvider,
  CloudApiProvider,
  LinkApiProvider,
  AnalyticsProvider,
  ToastProvider,
  AuthProvider,
  EscapeStackProvider,
  UpdateAvailableProvider,
  LinkProvider,
  SqliteProvider,
  ConnectionsProvider,
  ActiveConnectionProvider,
  EditProvider,
  TabsProvider,
  QueriesProvider,
  DragAndDropProvider,
  AddToDesktopProvider,
} satisfies Record<keyof ContextTypes, React.FC<PropsWithChildren>>;

export type ProvidersProps = PropsWithChildren;

export const Providers: React.FC<ProvidersProps> = (props) => {
  const { children } = props;

  return <ProviderStack providers={providers}>{children}</ProviderStack>;
};
