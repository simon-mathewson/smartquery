import {
  LightbulbOutlined,
  PersonAddAlt1Outlined,
  QuestionAnswerOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { useRef } from 'react';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '../analytics/Context';
import { AuthContext } from '../auth/Context';
import { Settings } from '../settings/Settings';
import { Plans } from '../subscriptions/plans/Plans';

export const Footer: React.FC = () => {
  const [, navigate] = useLocation();
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
    onOpen: () => track('footer_open_plans'),
  });

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[340px]' }} overlay={settingsOverlay}>
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
      <OverlayCard overlay={plansOverlay}>
        {({ close }) => (
          <Plans
            onContinue={(plan) => {
              if (plan === 'free') {
                navigate(routes.signup());
              } else {
                const searchParams = new URLSearchParams({
                  type: plan,
                  stage: 'signup',
                });
                navigate(routes.subscribe() + `?${searchParams.toString()}`);
              }

              void close();
            }}
          />
        )}
      </OverlayCard>
      <div className="fixed bottom-2 left-2 w-[224px] space-y-1 rounded-tr-lg bg-background pt-1">
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
        <div className="flex items-center">
          <Button
            color="secondary"
            element="a"
            htmlProps={{
              className: '[&>svg]:text-textTertiary',
              href: import.meta.env.VITE_DISCORD_INVITE_URL,
              target: '_blank',
            }}
            icon={<QuestionAnswerOutlined />}
            tooltip="Ask questions and share your feedback, feature requests, and bug reports on Discord"
          />
          <div className="flex flex-col gap-[2px]">
            <div className="text-xs text-textTertiary">© 2025 Simon Mathewson</div>
            <div className="flex items-center gap-1">
              <a
                href={import.meta.env.VITE_IMPRINT_URL}
                className="text-xs text-textTertiary hover:underline"
                target="_blank"
              >
                Imprint
              </a>
              <div className="text-xs text-textTertiary">&middot;</div>
              <a
                href={import.meta.env.VITE_TERMS_URL}
                className="text-xs text-textTertiary hover:underline"
                target="_blank"
              >
                Terms
              </a>
              <div className="text-xs text-textTertiary">&middot;</div>
              <a
                href={import.meta.env.VITE_PRIVACY_URL}
                className="text-xs text-textTertiary hover:underline"
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
