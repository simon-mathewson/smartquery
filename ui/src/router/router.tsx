import { createBrowserRouter } from 'react-router-dom';
import { App } from '~/App';
import { Database } from '~/content/database/Database';
import { routes } from './routes';
import { Home } from '~/content/home/Home';

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
        path: routes.database(),
        element: <Database />,
      },
    ],
  },
]);
