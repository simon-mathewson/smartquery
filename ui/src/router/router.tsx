import { createBrowserRouter } from 'react-router-dom';
import { App } from '~/App';
import { routes } from './routes';
import { Home } from '~/content/home/Home';
import { Database } from '~/content/database/Database';
import { Setup } from '~/content/link/setup/Setup';

export const router = createBrowserRouter([
  {
    path: routes.root(),
    element: <App />,
    children: [
      {
        path: routes.root(),
        element: <Home />,
      },
      {
        path: routes.setup(),
        element: <Setup />,
      },
      {
        path: routes.database(),
        element: <Database />,
      },
    ],
  },
]);
