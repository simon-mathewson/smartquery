import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ConnectionsProvider } from './content/connections/Provider';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { TabsProvider } from './content/tabs/Provider';
import { ThemeProvider } from './content/theme/Provider';
import { ClickOutsideQueueProvider } from './shared/hooks/useClickOutside/useQueue/Provider';
import { EditProvider } from './content/edit/Provider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ConnectionsProvider>
        <EditProvider>
          <TabsProvider>
            <DragAndDropProvider>
              <ClickOutsideQueueProvider>
                <App />
              </ClickOutsideQueueProvider>
            </DragAndDropProvider>
          </TabsProvider>
        </EditProvider>
      </ConnectionsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
