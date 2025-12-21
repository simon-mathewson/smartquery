import {
  LightbulbOutlined,
  PersonAddAlt1Outlined,
  SettingsOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import classNames from 'classnames';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '../../../content/analytics/Context';
import { AuthContext } from '../../../content/auth/Context';
import { Settings } from '../../../content/settings/Settings';
import { Plans } from '../../../content/subscriptions/plans/Plans';
import { AboutLinks } from '../aboutLinks/AboutLinks';

export type FooterProps = {
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { htmlProps } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);

  const settingsOverlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    onOpen: () => track('footer_open_settings'),
  });

  const plansOverlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    onOpen: () => (user ? track('footer_open_plans') : track('footer_sign_up')),
  });

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[340px]' }} overlay={settingsOverlay}>
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
      <OverlayCard overlay={plansOverlay}>
        {({ close }) => (
          <Plans
            afterContinue={() => {
              void close();
            }}
          />
        )}
      </OverlayCard>
      <div
        className={classNames(
          'sticky bottom-0 mt-auto w-full space-y-1 overflow-hidden py-1',
          htmlProps?.className,
        )}
      >
        {!user && (
          <Button
            align="left"
            element="link"
            htmlProps={{
              className: 'w-full',
              href: routes.login(),
              onClick: () => track('footer_log_in'),
            }}
            icon={<VpnKeyOutlined />}
            label="Log in"
          />
        )}
        {!user?.activeSubscription && !window.ReactNativeWebView && (
          <Button
            align="left"
            htmlProps={{
              className: 'w-full',
              ...plansOverlay.triggerProps,
            }}
            icon={user ? <LightbulbOutlined /> : <PersonAddAlt1Outlined />}
            label={user ? 'Get access to all features' : 'Sign up to use AI for free'}
          />
        )}
        <Button
          align="left"
          color="secondary"
          htmlProps={{
            className: 'w-full',
            ...settingsOverlay.triggerProps,
          }}
          icon={<SettingsOutlined />}
          label={user?.email ?? 'Settings'}
        />
        <AboutLinks compact />
      </div>
    </>
  );
};
