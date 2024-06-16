import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { EditProvider } from './content/edit/Provider';
import { LinkProvider } from './content/link/Provider';
import { AddToDesktopProvider } from './content/settings/addToDesktop/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { QueriesProvider } from './content/tabs/Queries/Provider';
import { TrpcProvider } from './content/trpc/Provider';
import { BaseProviders } from './baseProviders/BaseProviders';

export const App: React.FC = () => {
  return (
    <BaseProviders>
      <TrpcProvider>
        <LinkProvider>
          <ConnectionsProvider>
            <EditProvider>
              <TabsProvider>
                <QueriesProvider>
                  <DragAndDropProvider>
                    <AddToDesktopProvider>
                      <Outlet />
                    </AddToDesktopProvider>
                  </DragAndDropProvider>
                </QueriesProvider>
              </TabsProvider>
            </EditProvider>
          </ConnectionsProvider>
        </LinkProvider>
      </TrpcProvider>
    </BaseProviders>
  );
};
