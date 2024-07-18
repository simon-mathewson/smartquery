import { SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Settings } from './Settings';

export const SettingsOverlay: React.FC = () => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button
        className="sticky bottom-0 left-2 mb-2 mt-auto"
        color="secondary"
        icon={<SettingsOutlined />}
        ref={triggerRef}
      />
      <OverlayCard
        align="center"
        htmlProps={{ className: 'w-[340px]' }}
        darkenBackground
        triggerRef={triggerRef}
      >
        {() => <Settings />}
      </OverlayCard>
    </>
  );
};
