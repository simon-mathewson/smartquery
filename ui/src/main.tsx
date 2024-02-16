import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ConnectionsProvider } from './content/connections/Provider';
import { QueriesProvider } from './content/queries/Context';
import { DragAndDropProvider } from './content/dragAndDrop/Provider';
import { ClickOutsideQueueProvider } from './shared/hooks/useClickOutside/useQueue/Provider';
import { EditProvider } from './content/edit/Provider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConnectionsProvider>
      <QueriesProvider>
        <EditProvider>
          <DragAndDropProvider>
            <ClickOutsideQueueProvider>
              <App />
            </ClickOutsideQueueProvider>
          </DragAndDropProvider>
        </EditProvider>
      </QueriesProvider>
    </ConnectionsProvider>
  </React.StrictMode>,
);
