import {
  GitHub,
  LightbulbOutlined,
  PersonAddAlt1Outlined,
  SettingsOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import classNames from 'classnames';
import { useRef } from 'react';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '../../../content/analytics/Context';
import { AuthContext } from '../../../content/auth/Context';
import { Settings } from '../../../content/settings/Settings';
import { Plans } from '../../../content/subscriptions/plans/Plans';

export type FooterProps = {
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { htmlProps } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { user } = useDefinedContext(AuthContext);

  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const settingsOverlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    triggerRef: settingsButtonRef,
    onOpen: () => track('footer_open_settings'),
  });

  const plansButtonRef = useRef<HTMLButtonElement | null>(null);

  const plansOverlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    triggerRef: plansButtonRef,
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
          'sticky bottom-0 mt-auto w-full space-y-1 overflow-hidden bg-background py-1',
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
        {!user?.activeSubscription && (
          <Button
            align="left"
            htmlProps={{
              className: 'w-full',
              ref: plansButtonRef,
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
            ref: settingsButtonRef,
          }}
          icon={<SettingsOutlined />}
          label={user?.email ?? 'Settings'}
        />
        <div className="flex items-center overflow-hidden">
          <Button
            color="secondary"
            element="a"
            htmlProps={{
              className: '[&>svg]:text-textTertiary',
              href: import.meta.env.VITE_GITHUB_URL,
              target: '_blank',
            }}
            icon={<GitHub />}
            tooltip="GitHub"
          />
          <div className="flex flex-col gap-[2px] overflow-hidden pr-1">
            <div className="truncate text-xs text-textTertiary">© 2025 Simon Mathewson</div>
            <div className="flex items-center gap-1 overflow-hidden">
              <a
                href={import.meta.env.VITE_IMPRINT_URL}
                className="truncate text-xs text-textTertiary hover:underline"
                target="_blank"
              >
                Imprint
              </a>
              <div className="text-xs text-textTertiary">&middot;</div>
              <a
                href={import.meta.env.VITE_TERMS_URL}
                className="truncate text-xs text-textTertiary hover:underline"
                target="_blank"
              >
                Terms
              </a>
              <div className="text-xs text-textTertiary">&middot;</div>
              <a
                href={import.meta.env.VITE_PRIVACY_URL}
                className="truncate text-xs text-textTertiary hover:underline"
                target="_blank"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
