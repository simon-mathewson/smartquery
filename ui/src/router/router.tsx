import { createBrowserRouter } from 'react-router-dom';
import { App } from '~/App';
import { Database } from '~/content/database/Database';
import { routes } from './routes';

export const router = createBrowserRouter([
  {
    path: routes.root,
    element: <App />,
    children: [
      {
        path: routes.database(),
        element: <Database />,
      },
    ],
  },
]);
