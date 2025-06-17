import type { PropsWithChildren } from 'react';
import React from 'react';
import { assert } from 'ts-essentials';
import { AiProvider } from '~/content/ai/Provider';
import { AuthProvider } from '~/content/auth/Provider';
import { CloudApiProvider } from '~/content/cloud/api/Provider';
import { ConnectionsProvider } from '~/content/connections/Provider';
import { DragAndDropProvider } from '~/content/dragAndDrop/Provider';
import { EditProvider } from '~/content/edit/Provider';
import { LinkApiProvider } from '~/content/link/api/Provider';
import { LinkProvider } from '~/content/link/Provider';
import { AddToDesktopProvider } from '~/content/settings/addToDesktop/Provider';
import { SqliteProvider } from '~/content/sqlite/Provider';
import { TabsProvider } from '~/content/tabs/Provider';
import { QueriesProvider } from '~/content/tabs/queries/Provider';
import { ThemeProvider } from '~/content/theme/Provider';
import { ToastProvider } from '../content/toast/Provider';
import { EscapeStackProvider } from '../shared/hooks/useEscape/useStack/Provider';
import { useBuildProviders } from './useBuildProviders';

const providers = {
  ThemeProvider,
  AiProvider,
  EscapeStackProvider,
  ToastProvider,
  CloudApiProvider,
  AuthProvider,
  LinkApiProvider,
  LinkProvider,
  SqliteProvider,
  ConnectionsProvider,
  EditProvider,
  TabsProvider,
  QueriesProvider,
  DragAndDropProvider,
  AddToDesktopProvider,
} as const;

export type ProvidersProps = PropsWithChildren;

export const Providers: React.FC<ProvidersProps> = (props) => {
  const { children } = props;

  const AllProviders = useBuildProviders(providers, children);

  assert(AllProviders !== null);

  return <AllProviders />;
};
