import { GitHub, SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Settings } from '../settings/Settings';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import { AnalyticsContext } from '../analytics/Context';
import { useOverlay } from '~/shared/components/overlay/useOverlay';

export const Footer: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);

  const { user } = useDefinedContext(AuthContext);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const overlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    triggerRef,
    onOpen: () => track('open_settings'),
  });

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[340px] overflow-auto' }} overlay={overlay}>
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
      <div className="fixed bottom-2 left-2 w-[208px]">
        <Button
          align="left"
          color="secondary"
          htmlProps={{
            className: 'w-full',
            ref: triggerRef,
          }}
          icon={<SettingsOutlined />}
          label={user?.email ?? 'Settings'}
        />
        <div className="flex pt-1">
          <Button
            color="secondary"
            element="a"
            htmlProps={{
              className: '[&>svg]:text-textTertiary',
              href: import.meta.env.VITE_GITHUB_DISCUSSIONS_URL,
              target: '_blank',
            }}
            icon={<GitHub />}
            tooltip="Ask questions and share your feedback, feature requests, and bug reports on GitHub Discussions"
          />
          <div className="flex flex-col gap-[2px] pt-1">
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
