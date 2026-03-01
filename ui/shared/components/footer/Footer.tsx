import { SettingsOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import { Button } from '~/shared/components/button/Button';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '../../../content/analytics/Context';
import { Settings } from '../../../content/settings/Settings';
import { AboutLinks } from '../aboutLinks/AboutLinks';

export type FooterProps = {
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const Footer: React.FC<FooterProps> = (props) => {
  const { htmlProps } = props;

  const { track } = useDefinedContext(AnalyticsContext);

  const settingsOverlay = useOverlay({
    align: 'center',
    darkenBackground: true,
    onOpen: () => track('footer_open_settings'),
  });

  return (
    <>
      <OverlayCard htmlProps={{ className: 'w-[340px] !px-0 !pb-0' }} overlay={settingsOverlay}>
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
      <div
        className={classNames(
          'sticky bottom-0 mt-auto w-full space-y-1 overflow-hidden py-1',
          htmlProps?.className,
        )}
      >
        <Button
          align="left"
          color="secondary"
          htmlProps={{
            className: 'w-full',
            ...settingsOverlay.triggerProps,
          }}
          icon={<SettingsOutlined />}
          label="Settings"
        />
        <AboutLinks compact />
      </div>
    </>
  );
};
