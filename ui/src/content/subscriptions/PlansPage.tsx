import { useLocation } from 'wouter';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { AnalyticsContext } from '../analytics/Context';
import { routes } from '~/router/routes';
import { Card } from '~/shared/components/card/Card';
import { Plans } from './plans/Plans';

export const SubscribePlansPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useDefinedContext(AuthContext);
  const { track } = useDefinedContext(AnalyticsContext);

  return (
    <Page title="Subscribe" htmlProps={{ className: 'max-w-none' }}>
      <Card htmlProps={{ className: 'container max-w-max' }}>
        <Plans
          onBack={() => history.back()}
          onContinue={(type) => {
            track('subscribe_plans_continue', { type });

            if (type === 'free') {
              navigate(routes.signup());
              return;
            }

            if (user) {
              navigate(routes.subscribeCheckout(type), { replace: false });
            } else {
              navigate(routes.subscribeAuth(type), { replace: false });
            }
          }}
        />
      </Card>
    </Page>
  );
};
