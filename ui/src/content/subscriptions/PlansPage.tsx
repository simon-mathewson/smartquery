import { Card } from '~/shared/components/card/Card';
import { Page } from '~/shared/components/page/Page';
import { Plans } from './plans/Plans';

export const SubscribePlansPage: React.FC = () => (
  <Page title="Subscribe" htmlProps={{ className: 'max-w-none' }}>
    <Card htmlProps={{ className: 'container max-w-max' }}>
      <Plans onBack={() => history.back()} />
    </Card>
  </Page>
);
