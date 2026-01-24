import { Page } from '~/shared/components/page/Page';
import { ConnectionForm } from '../form/ConnectionForm';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export const AddConnectionPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Page title="Add connection">
      <ConnectionForm exit={() => navigate(routes.root())} />
    </Page>
  );
};
