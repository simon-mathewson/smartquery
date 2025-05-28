import React from 'react';
import { Route, Switch } from 'wouter';
import { App } from '~/App';
import { Database } from '~/content/database/Database';
import { Home } from '~/content/home/Home';
import { routes } from './routes';
import { Signup } from '~/content/auth/Signup/Signup';
import { AddConnectionPage } from '~/content/connections/AddConnectionPage/AddConnectionPage';
import { Login } from '~/content/auth/Login/Login';

export const Router: React.FC = () => {
  return (
    <Route path={routes.root()} nest>
      <App>
        <Switch>
          <Route path={routes.root()} component={Home} />
          <Route path={routes.addConnection()} component={AddConnectionPage} />
          <Route path={routes.database()} component={Database} />
          <Route path={routes.database({ schema: '' })} component={Database} />
          <Route path={routes.database({ schema: '', database: '' })} component={Database} />
          <Route path={routes.login()} component={Login} />
          <Route path={routes.signup()} component={Signup} />
        </Switch>
      </App>
    </Route>
  );
};
