import React, { Suspense, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'wouter';
import { Loading } from '~/shared/components/loading/Loading';
import { routes } from './routes';

// Lazy load all components
const Login = React.lazy(() =>
  import('~/content/auth/Login/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const Signup = React.lazy(() =>
  import('~/content/auth/Signup/SignupPage').then((module) => ({ default: module.SignupPage })),
);
const SubscribePlans = React.lazy(() =>
  import('~/content/subscriptions/PlansPage').then((module) => ({
    default: module.SubscribePlansPage,
  })),
);
const SubscribeAuth = React.lazy(() =>
  import('~/content/subscriptions/AuthPage').then((module) => ({
    default: module.SubscribeAuthPage,
  })),
);
const SubscribeCheckout = React.lazy(() =>
  import('~/content/subscriptions/CheckoutPage').then((module) => ({
    default: module.SubscribeCheckoutPage,
  })),
);
const SubscribeConfirm = React.lazy(() =>
  import('~/content/subscriptions/ConfirmPage').then((module) => ({
    default: module.SubscribeConfirmPage,
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
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
        <Route path={routes.verifyEmail()} component={VerifyEmail} />
        <Route path={routes.requestResetPassword()} component={RequestResetPassword} />
        <Route path={routes.resetPassword()} component={ResetPassword} />

        <Route path={routes.connectToMysql()} component={ConnectToMysql} />
        <Route path={routes.connectToPostgres()} component={ConnectToPostgres} />
        <Route path={routes.openSqlite()} component={OpenSqlite} />

        <Route path={routes.subscribe()}>
          <Redirect to={routes.subscribePlans()} />
        </Route>
        <Route path={routes.subscribePlans()} component={SubscribePlans} />
        <Route path={routes.subscribeAuth()} component={SubscribeAuth} />
        <Route path={routes.subscribeCheckout()} component={SubscribeCheckout} />
        <Route path={routes.subscribeConfirm()} component={SubscribeConfirm} />
      </Switch>
    </Suspense>
  );
};
