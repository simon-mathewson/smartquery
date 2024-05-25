import { SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/Button/Button';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { Settings } from './Settings';

export const SettingsOverlay: React.FC = () => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const location = useLocation();

  if (location.pathname === routes.setup()) {
    return null;
  }

  return (
    <>
      <Button
        className="absolute bottom-2 left-2"
        color="secondary"
        icon={<SettingsOutlined />}
        ref={triggerRef}
      />
      <OverlayCard align="center" className="w-[340px]" darkenBackground triggerRef={triggerRef}>
        {() => <Settings />}
      </OverlayCard>
    </>
  );
};
