import React from 'react';
import { Route, Switch } from 'wouter';
import { Login } from '~/content/auth/Login/Login';
import { Signup } from '~/content/auth/Signup/Signup';
import { AddConnectionPage } from '~/content/connections/addConnectionPage/AddConnectionPage';
import { Connection } from '~/content/connections/page/Connection';
import { Home } from '~/content/home/Home';
import { routes } from './routes';
import { ConnectToPostgres } from '~/content/landingPages/connectToPostgres/ConnectToPostgres';
import { OpenSqlite } from '~/content/landingPages/openSqlite/OpenSqlite';
import { ConnectToMysql } from '~/content/landingPages/connectToMysql/ConnectToMysql';

export const Router: React.FC = () => {
  return (
    <Switch>
      <Route path={routes.root()} component={Home} />

      <Route path={routes.addConnection()} component={AddConnectionPage} />
      <Route path={routes.connection()} component={Connection} />
      <Route path={routes.connection({ schema: '' })} component={Connection} />
      <Route path={routes.connection({ schema: '', database: '' })} component={Connection} />

      <Route path={routes.login()} component={Login} />
      <Route path={routes.signup()} component={Signup} />

      <Route path={routes.connectToMysql()} component={ConnectToMysql} />
      <Route path={routes.connectToPostgres()} component={ConnectToPostgres} />
      <Route path={routes.openSqlite()} component={OpenSqlite} />
    </Switch>
  );
};
