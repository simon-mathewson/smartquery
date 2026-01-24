import { Page } from '~/shared/components/page/Page';
import { Plans } from './plans/Plans';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export const SubscribePlansPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Page title="Subscribe">
      <Plans onBack={() => navigate(routes.root())} />
    </Page>
  );
};
