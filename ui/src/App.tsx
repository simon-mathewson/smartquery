import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { EditProvider } from './content/edit/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { QueriesProvider } from './content/tabs/Queries/Provider';
import { useTheme } from './content/theme/useTheme';
import './index.css';
import { ClickOutsideQueueProvider } from './shared/hooks/useClickOutside/useQueue/Provider';
import { LinkProvider } from './content/link/Provider';

export const App: React.FC = () => {
  useTheme();

  return (
    <ClickOutsideQueueProvider>
      <LinkProvider>
        <ConnectionsProvider>
          <EditProvider>
            <TabsProvider>
              <QueriesProvider>
                <DragAndDropProvider>
                  <Outlet />
                </DragAndDropProvider>
              </QueriesProvider>
            </TabsProvider>
          </EditProvider>
        </ConnectionsProvider>
      </LinkProvider>
    </ClickOutsideQueueProvider>
  );
};
