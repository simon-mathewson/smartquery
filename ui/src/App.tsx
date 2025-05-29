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
import { LinkApiProvider } from './content/link/api/Provider';
import { CloudApiProvider } from './content/cloud/api/Provider';
import { AuthProvider } from './content/auth/Provider';

export const App: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <BaseProviders>
      <CloudApiProvider>
        <AuthProvider>
          <LinkApiProvider>
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
          </LinkApiProvider>
        </AuthProvider>
      </CloudApiProvider>
    </BaseProviders>
  );
};
