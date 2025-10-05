import { Page } from '~/shared/components/page/Page';
import { Signup } from './Signup';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export const SignupPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Page title="Signup">
      <Signup
        onBack={() => history.back()}
        onSuccess={() => navigate(routes.root())}
        onShowLogin={() => navigate(routes.login())}
      />
    </Page>
  );
};
