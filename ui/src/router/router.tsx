import React from 'react';
import { Route, Switch } from 'wouter';
import { App } from '~/App';
import { Database } from '~/content/database/Database';
import { Home } from '~/content/home/Home';
import { Welcome } from '~/content/welcome/Welcome';
import { routes } from './routes';

export const Router: React.FC = () => {
  return (
    <Route path={routes.root()} nest>
      <App>
        <Switch>
          <Route path={routes.root()} component={Home} />
          <Route path={routes.welcome()} component={Welcome} />
          <Route path={routes.database()} component={Database} />
          <Route path={routes.database({ schema: '' })} component={Database} />
          <Route path={routes.database({ schema: '', database: '' })} component={Database} />
        </Switch>
      </App>
    </Route>
  );
};
