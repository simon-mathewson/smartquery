import React from 'react';
import { BaseProviders } from './baseProviders/BaseProviders';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { EditProvider } from './content/edit/Provider';
import { LinkProvider } from './content/link/Provider';
import { AddToDesktopProvider } from './content/settings/addToDesktop/Provider';
import { SqliteProvider } from './content/sqlite/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { QueriesProvider } from './content/tabs/queries/Provider';
import { TrpcProvider } from './content/trpc/Provider';

export const App: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <BaseProviders>
      <TrpcProvider>
        <LinkProvider>
          <SqliteProvider>
            <ConnectionsProvider>
              <EditProvider>
                <TabsProvider>
                  <QueriesProvider>
                    <DragAndDropProvider>
                      <AddToDesktopProvider>{children}</AddToDesktopProvider>
                    </DragAndDropProvider>
                  </QueriesProvider>
                </TabsProvider>
              </EditProvider>
            </ConnectionsProvider>
          </SqliteProvider>
        </LinkProvider>
      </TrpcProvider>
    </BaseProviders>
  );
};
