import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../link/src/main/router';
import superjson from 'superjson';
import { ConnectionsProvider } from './content/connections/Context';
import { QueriesProvider } from './content/queries/Context';
import { DragAndDropProvider } from './content/dragAndDrop/Context';
import { ClickOutsideQueueProvider } from './shared/hooks/useClickOutside/useQueue/Context';
import { EditProvider } from './content/edit/Context';

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});

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
