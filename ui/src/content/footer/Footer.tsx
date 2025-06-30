import { SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Settings } from '../settings/Settings';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import classNames from 'classnames';
import { AnalyticsContext } from '../analytics/Context';

export const Footer: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);

  const { user } = useDefinedContext(AuthContext);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <OverlayCard
        align="center"
        htmlProps={{ className: 'w-[340px]' }}
        darkenBackground
        triggerRef={triggerRef}
        onOpen={() => track('open_settings')}
      >
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
      <div className="fixed bottom-2 left-2 w-[224px]">
        <Button
          align="left"
          color="secondary"
          htmlProps={{
            className: classNames({ 'w-[208px]': user }),
            ref: triggerRef,
          }}
          icon={<SettingsOutlined />}
          label={user?.email}
        />
        <div className="flex flex-col gap-[2px] pl-1 pt-1">
          <div className="text-xs text-textTertiary">© 2025 Simon Mathewson</div>
          <div className="flex items-center gap-1">
            <a
              href={`${import.meta.env.VITE_ABOUT_URL}/imprint`}
              className="text-xs text-textTertiary hover:underline"
              target="_blank"
            >
              Imprint
            </a>
            <div className="text-xs text-textTertiary">&middot;</div>
            <a
              href={`${import.meta.env.VITE_ABOUT_URL}/terms-of-use`}
              className="text-xs text-textTertiary hover:underline"
              target="_blank"
            >
              Terms
            </a>
            <div className="text-xs text-textTertiary">&middot;</div>
            <a
              href={`${import.meta.env.VITE_ABOUT_URL}/privacy-policy`}
              className="text-xs text-textTertiary hover:underline"
              target="_blank"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
