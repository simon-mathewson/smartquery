import React, { Suspense, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { Loading } from '~/shared/components/loading/Loading';
import { routes } from './routes';

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

        <Route path={routes.connectToMysql()} component={ConnectToMysql} />
        <Route path={routes.connectToPostgres()} component={ConnectToPostgres} />
        <Route path={routes.openSqlite()} component={OpenSqlite} />
      </Switch>
    </Suspense>
  );
};
