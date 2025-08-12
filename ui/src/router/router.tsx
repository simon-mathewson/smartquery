import React, { Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { routes } from './routes';
import { Loading } from '~/shared/components/loading/Loading';

// Lazy load all components
const Login = React.lazy(() =>
  import('~/content/auth/Login/Login').then((module) => ({ default: module.Login })),
);
const Signup = React.lazy(() =>
  import('~/content/auth/Signup/SignupPage').then((module) => ({ default: module.SignupPage })),
);
const Subscribe = React.lazy(() =>
  import('~/content/subscriptions/SubscribePage').then((module) => ({
    default: module.SubscribePage,
  })),
);
const VerifyEmail = React.lazy(() =>
  import('~/content/auth/VerifyEmail/VerifyEmail').then((module) => ({
    default: module.VerifyEmail,
  })),
);
const RequestResetPassword = React.lazy(() =>
  import('~/content/auth/RequestResetPassword/RequestResetPassword').then((module) => ({
    default: module.RequestResetPassword,
  })),
);
const ResetPassword = React.lazy(() =>
  import('~/content/auth/ResetPassword/ResetPassword').then((module) => ({
    default: module.ResetPassword,
  })),
);
const AddConnectionPage = React.lazy(() =>
  import('~/content/connections/addConnectionPage/AddConnectionPage').then((module) => ({
    default: module.AddConnectionPage,
  })),
);
const Connection = React.lazy(() =>
  import('~/content/connections/page/Connection').then((module) => ({
    default: module.Connection,
  })),
);
const Home = React.lazy(() =>
  import('~/content/home/Home').then((module) => ({ default: module.Home })),
);
const ConnectToPostgres = React.lazy(() =>
  import('~/content/landingPages/connectToPostgres/ConnectToPostgres').then((module) => ({
    default: module.ConnectToPostgres,
  })),
);
const OpenSqlite = React.lazy(() =>
  import('~/content/landingPages/openSqlite/OpenSqlite').then((module) => ({
    default: module.OpenSqlite,
  })),
);
const ConnectToMysql = React.lazy(() =>
  import('~/content/landingPages/connectToMysql/ConnectToMysql').then((module) => ({
    default: module.ConnectToMysql,
  })),
);

export const Router: React.FC = () => {
  return (
    <Suspense fallback={<Loading size="large" />}>
      <Switch>
        <Route path={routes.root()} component={Home} />

        <Route path={routes.addConnection()} component={AddConnectionPage} />
        <Route path={routes.connection()} component={Connection} />
        <Route path={routes.connection({ schema: '' })} component={Connection} />
        <Route path={routes.connection({ schema: '', database: '' })} component={Connection} />

        <Route path={routes.login()} component={Login} />
        <Route path={routes.signup()} component={Signup} />
        <Route path={routes.subscribe()} component={Subscribe} />
        <Route path={routes.verifyEmail()} component={VerifyEmail} />
        <Route path={routes.requestResetPassword()} component={RequestResetPassword} />
        <Route path={routes.resetPassword()} component={ResetPassword} />

        <Route path={routes.connectToMysql()} component={ConnectToMysql} />
        <Route path={routes.connectToPostgres()} component={ConnectToPostgres} />
        <Route path={routes.openSqlite()} component={OpenSqlite} />
      </Switch>
    </Suspense>
  );
};
