import { Page } from '~/shared/components/page/Page';
import { ConnectionForm } from '../form/ConnectionForm';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';
import { Card } from '~/shared/components/card/Card';

export const AddConnectionPage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <Page>
      <Card htmlProps={{ className: 'flex flex-col p-3' }}>
        <ConnectionForm exit={() => navigate(routes.root())} />
      </Card>
    </Page>
  );
};
