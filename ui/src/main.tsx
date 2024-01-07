import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../link/src/main/router';
import superjson from 'superjson';
import { ConnectionsProvider } from './content/connections/Context';
import { QueriesProvider } from './content/queries/Context';
import { DragAndDropProvider } from './content/dragAndDrop/Context';
import { OverlayProvider } from './content/overlay/Context';

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
        <DragAndDropProvider>
          <OverlayProvider>
            <App />
          </OverlayProvider>
        </DragAndDropProvider>
      </QueriesProvider>
    </ConnectionsProvider>
  </React.StrictMode>,
);
