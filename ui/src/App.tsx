import React from 'react';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { EditProvider } from './content/edit/Provider';
import { LinkProvider } from './content/link/Provider';
import { AddToDesktopProvider } from './content/settings/addToDesktop/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { QueriesProvider } from './content/tabs/queries/Provider';
import { TrpcProvider } from './content/trpc/Provider';
import { BaseProviders } from './baseProviders/BaseProviders';
import { AiProvider } from './content/ai/Provider';
import { SqliteProvider } from './content/sqlite/Provider';

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
                      <AddToDesktopProvider>
                        <AiProvider>{children}</AiProvider>
                      </AddToDesktopProvider>
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
