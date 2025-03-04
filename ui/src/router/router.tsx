import React from 'react';
import { Route, Switch } from 'wouter';
import { App } from '~/App';
import { Database } from '~/content/database/Database';
import { Home } from '~/content/home/Home';
import { Setup } from '~/content/link/setup/Setup';
import { routes } from './routes';

export const Router: React.FC = () => {
  return (
    <Route path={routes.root()} nest>
      <App>
        <Switch>
          <Route path={routes.root()} component={Home} />
          <Route path={routes.setup()} component={Setup} />
          <Route path={routes.database()} component={Database} />
          <Route path={routes.database({ schema: '' })} component={Database} />
          <Route path={routes.database({ schema: '', database: '' })} component={Database} />
        </Switch>
      </App>
    </Route>
  );
};
