import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { EditProvider } from './content/edit/Provider';
import { LinkProvider } from './content/link/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { QueriesProvider } from './content/tabs/Queries/Provider';
import { useTheme } from './content/theme/useTheme';
import { ClickOutsideQueueProvider } from './shared/hooks/useClickOutside/useQueue/Provider';
import { TrpcProvider } from './content/trpc/Provider';
import { ErrorBoundary } from './content/errorBoundary/ErrorBoundary';
import { ToastProvider } from './content/toast/Provider';
import { AddToDesktopProvider } from './content/settings/addToDesktop/Provider';

export const App: React.FC = () => {
  useTheme();

  return (
    <ErrorBoundary>
      <ClickOutsideQueueProvider>
        <ToastProvider>
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
        </ToastProvider>
      </ClickOutsideQueueProvider>
    </ErrorBoundary>
  );
};
