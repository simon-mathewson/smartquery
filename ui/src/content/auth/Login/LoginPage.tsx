import { Page } from '~/shared/components/page/Page';
import { Login } from './Login';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export const LoginPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Page title="Login">
      <Login
        onBack={() => history.back()}
        onSuccess={() => navigate(routes.root())}
        onShowSignup={() => navigate(routes.subscribe())}
      />
    </Page>
  );
};
